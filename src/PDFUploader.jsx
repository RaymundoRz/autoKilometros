import "./styles.css";
import React, { useState, useRef } from "react";
import axios from "axios";
import Selecto from "react-selecto";
import StepIndicator from "./components/StepIndicator";

const PDFUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState([]);
  const [selectionArea, setSelectionArea] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const imageContainerRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadPDF = async () => {
    if (!selectedFile) {
      alert("Selecciona un archivo PDF.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5001/upload_pdf", formData);
      setImages(response.data.images);
    } catch (error) {
      console.error("Error al subir el PDF:", error);
      alert("Error al procesar el PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractData = async () => {
    if (!selectedImage || !selectionArea) {
      alert("Selecciona una imagen y define un área.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5001/extract_text", {
        image_path: selectedImage.replace("/images/", ""),
        cropped_area: selectionArea,
      });

      console.log("Datos Extraídos:", response.data.data);
      
      setExtractedText((prevText) => [
        ...prevText,
        { cantidad: response.data.data.join(" ") },
      ]);
    } catch (error) {
      console.error("Error al extraer datos:", error);
      alert("No se pudieron extraer los datos.");
    } finally {
      setIsLoading(false);
      setShowModal(false);
    }
  };

  const handleOpenModal = (img) => {
    setSelectedImage(img);
    setShowModal(true);
    setZoom(1);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectionArea(null);
  };

  return (
    <div className="uploader-container">
      <h1 className="title">Convertidor de PDF a Datos</h1>
      <StepIndicator steps={[{ label: "Subir Archivo" }, { label: "Extraer Datos" }]} />

      {/* Subir archivo */}
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUploadPDF} disabled={isLoading} className="button">
        {isLoading ? "Procesando..." : "Subir PDF"}
      </button>

      {/* Mostrar imágenes */}
      <div className="image-grid">
        {images.map((img, index) => (
          <img
            key={index}
            src={`http://127.0.0.1:5001${img}`}
            alt={`Página ${index + 1}`}
            className="image-thumbnail"
            onClick={() => handleOpenModal(img)}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={handleCloseModal} className="close-button">X</button>

            <div className="image-container" ref={imageContainerRef} style={{ zoom: zoom }}>
              <img
                src={`http://127.0.0.1:5001${selectedImage}`}
                alt="Seleccionar área"
                className="modal-image"
              />
              <Selecto
                container={imageContainerRef.current}
                selectableTargets={["img"]}
                selectByClick={true}
                selectFromInside={true}
                dragContainer={imageContainerRef.current}
                onSelectEnd={(e) => {
                  const rect = e.rect;
                  const area = {
                    x: Math.round(rect.left),
                    y: Math.round(rect.top),
                    width: Math.round(rect.width),
                    height: Math.round(rect.height),
                  };
                  setSelectionArea(area);
                  alert(`Coordenadas recibidas:\nX: ${area.x}, Y: ${area.y}\nW: ${area.width}, H: ${area.height}`);
                }}
              />
            </div>

            <div className="zoom-container">
              <label>Zoom:</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(e.target.value)}
              />
            </div>

            <button onClick={handleExtractData} className="extract-button">Extraer Datos</button>
          </div>
        </div>
      )}

      {/* Datos extraídos */}
      {extractedText.length > 0 && (
        <div className="data-container">
          <h2>Datos Extraídos</h2>
          <table>
            <thead>
              <tr>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {extractedText.map((item, index) => (
                <tr key={index}>
                  <td>{item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
