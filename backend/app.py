from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import camelot
import os
import pandas as pd
import uuid
from pdf2image import convert_from_path
import pytesseract
import fitz  # PyMuPDF

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde cualquier origen

UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def perform_ocr(pdf_path, output_path):
    """Convierte páginas image-based a texto usando OCR."""
    pages = convert_from_path(pdf_path, 300)  # Convertir páginas a imágenes
    ocr_pdf = fitz.open()  # Crear nuevo documento PDF

    for i, page in enumerate(pages):
        text = pytesseract.image_to_pdf_or_hocr(page, extension="pdf")  # Aplicar OCR
        text_page = fitz.open("pdf", text)  # Convertir texto a página PDF
        ocr_pdf.insert_pdf(text_page)  # Agregar página procesada al nuevo documento

    ocr_pdf.save(output_path)  # Guardar nuevo PDF procesado
    ocr_pdf.close()

@app.route("/upload", methods=["POST"])
def upload_pdf():
    """Procesa el archivo PDF recibido y devuelve un archivo Excel."""
    if "pdf" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    # Guardar el archivo PDF
    pdf_file = request.files["pdf"]
    pdf_filename = f"{uuid.uuid4()}.pdf"
    pdf_path = os.path.join(UPLOAD_FOLDER, pdf_filename)
    pdf_file.save(pdf_path)

    # Crear archivo temporal para OCR
    ocr_pdf_path = os.path.join(UPLOAD_FOLDER, f"ocr_{uuid.uuid4()}.pdf")

    try:
        # Aplicar OCR al PDF
        perform_ocr(pdf_path, ocr_pdf_path)

        # Procesar el PDF con Camelot
        tables = camelot.read_pdf(ocr_pdf_path, pages="all")
        if len(tables) == 0:
            return jsonify({"error": "No tables found in PDF"}), 400

        # Combinar tablas en un archivo Excel
        output_filename = f"{uuid.uuid4()}.xlsx"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
            for i, table in enumerate(tables):
                table.df.to_excel(writer, sheet_name=f"Table_{i + 1}", index=False)

        # Devolver el archivo Excel al cliente
        return send_file(output_path, as_attachment=True)

    except Exception as e:
        import traceback
        traceback.print_exc()  # Imprimir error en terminal
        return jsonify({"error": str(e)}), 500

    finally:
        # Limpiar archivos temporales
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(ocr_pdf_path):
            os.remove(ocr_pdf_path)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
