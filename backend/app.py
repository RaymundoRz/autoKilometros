from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
from pdf2image import convert_from_path
from PIL import Image
import pytesseract
import pandas as pd
import os
import uuid
import cv2
import numpy as np  # Asegúrate de importar numpy

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "backend", "uploads")
IMAGES_FOLDER = os.path.join(os.getcwd(), "backend", "images")
OUTPUT_FOLDER = os.path.join(os.getcwd(), "backend", "outputs")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(IMAGES_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/upload_pdf", methods=["POST"])
def upload_pdf():
    """Subir un PDF y convertir sus páginas en imágenes."""
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Guardar el archivo PDF
    pdf_file = request.files["pdf"]
    pdf_filename = f"{uuid.uuid4()}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
    pdf_file.save(pdf_path)

    try:
        # Convertir PDF a imágenes
        images = convert_from_path(pdf_path, 300)  # 300 DPI para mejor precisión
        image_paths = []
        for i, image in enumerate(images):
            image_path = os.path.join(IMAGES_FOLDER, f"page_{i + 1}.png")
            image.save(image_path, "PNG")
            image_paths.append(f"/images/page_{i + 1}.png")

        return jsonify({"images": image_paths}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)

@app.route("/images/<path:filename>")
def serve_image(filename):
    """Servir imágenes desde el directorio backend/images."""
    return send_from_directory(IMAGES_FOLDER, filename)

@app.route("/extract_text", methods=["POST"])
def extract_text():
    """Seleccionar una imagen y aplicar OCR con extracción de tablas."""
    data = request.get_json()
    image_path = os.path.join(IMAGES_FOLDER, data.get("image_path"))
    cropped_area = data.get("cropped_area")

    if not os.path.exists(image_path):
        return jsonify({"error": "Image file not found"}), 400

    try:
        # 1. Cargar la imagen original
        image = Image.open(image_path)

        # 2. Recortar la imagen si se reciben coordenadas
        if cropped_area:
            x = cropped_area["x"]
            y = cropped_area["y"]
            width = cropped_area["width"]
            height = cropped_area["height"]
            
            # Verificar que las coordenadas estén dentro de la imagen
            img_width, img_height = image.size
            if x < 0 or y < 0 or x + width > img_width or y + height > img_height:
                return jsonify({"error": "Cropped area is out of image bounds"}), 400

            # Recortar el área seleccionada
            image = image.crop((x, y, x + width, y + height))

        # Convertir la imagen recortada a escala de grises y procesarla con OpenCV
        image_cv = cv2.cvtColor(cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR), cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(image_cv, 150, 255, cv2.THRESH_BINARY_INV)

        # 3. Aplicar OCR con pytesseract
        ocr_result = pytesseract.image_to_string(thresh, config="--psm 6")

        # 4. Procesar texto en filas y columnas
        lines = ocr_result.strip().split("\n")
        cleaned_data = []
        for line in lines:
            row = line.split()
            if row:
                cleaned_data.append(row)

        # 5. Normalizar filas con mismo número de columnas
        max_columns = max(len(row) for row in cleaned_data)
        normalized_data = [row + [''] * (max_columns - len(row)) for row in cleaned_data]

        # 6. Convertir a DataFrame y a CSV
        df = pd.DataFrame(normalized_data)
        csv_path = os.path.join(OUTPUT_FOLDER, "extracted_table.csv")
        df.to_csv(csv_path, index=False, header=False)

        # Retornar los datos en formato JSON
        formatted_rows = df.apply(lambda row: row.tolist(), axis=1).tolist()
        return jsonify({"data": formatted_rows, "csv_path": csv_path}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download_csv", methods=["GET"])
def download_csv():
    """Descargar el archivo CSV generado."""
    csv_path = request.args.get("csv_path")
    if not csv_path or not os.path.exists(csv_path):
        return jsonify({"error": "CSV file not found"}), 400

    return send_file(csv_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
