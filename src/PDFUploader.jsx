import React, { useState } from "react";
import axios from "axios";
import StepIndicator from "./components/StepIndicator";
import BaseTableManager from "./components/BaseTableManager";
import * as XLSX from "xlsx";

// Función para generar dinámicamente datos de Km, Hasta, Clase, Modelo y Cantidad con errores
const generateKmHastaClaseModeloData = () => {
  const kmHastaRanges = [
    { km: "0", hasta: "5,000" },
    { km: "5,001", hasta: "10,000" },
    { km: "10,001", hasta: "15,000" },
    { km: "15,001", hasta: "20,000" },
    { km: "20,001", hasta: "25,000" },
    { km: "25,001", hasta: "30,000" },
    { km: "30,001", hasta: "35,000" },
    { km: "35,001", hasta: "40,000" },
    { km: "40,001", hasta: "50,000" },
    { km: "50,001", hasta: "60,000" },
  ];

  const classes = ["A", "B", "C", "D", "E"];
  const years = [2024, 2023, 2022, 2021, 2020];

  // Datos de Cantidad con errores simulados
  const faultyQuantities = [
    "2,300", "3,000", "3#600", "5,3O0", "7x500", "-8,500", "11,1OO", 
    "13,5OO", "20,00O", "28,200", "NaN", "??", "-1,900", "ERROR", "∞"
  ];

  const kmHastaClaseModeloData = [];
  let quantityIndex = 0;

  kmHastaRanges.forEach(({ km, hasta }) => {
    years.forEach((year) => {
      classes.forEach((clase) => {
        const faultyQuantity = faultyQuantities[quantityIndex % faultyQuantities.length];
        kmHastaClaseModeloData.push({
          Km: km,
          Hasta: hasta,
          Clase: clase,
          Modelo: year,
          Cantidad: faultyQuantity, // Cantidad con errores
        });
        quantityIndex++;
      });
    });
  });

  return kmHastaClaseModeloData;
};

const PDFUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [steps, setSteps] = useState([
    { label: "Select File", description: "Choose a PDF file to upload", status: "in-progress" },
    { label: "Upload File", description: "Upload the selected PDF", status: "pending" },
    { label: "Convert File", description: "Convert the PDF to Excel", status: "pending" },
  ]);
  const [processedData, setProcessedData] = useState([]);
  const [isProcessingComplete, setIsProcessingComplete] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setSteps((prevSteps) =>
      prevSteps.map((step, index) =>
        index === 0 ? { ...step, status: "completed" } : step
      )
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    setIsLoading(true);
    setSteps((prevSteps) =>
      prevSteps.map((step, index) =>
        index === 1 ? { ...step, status: "in-progress" } : step
      )
    );

    try {
      const response = await axios.post("http://127.0.0.1:5001/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      const fileBlob = response.data;
      const url = window.URL.createObjectURL(new Blob([fileBlob]));
      setDownloadUrl(url);

      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: ["Km", "Hasta", "Clase", "Modelo", "Cantidad"],
        });

        const generatedData = generateKmHastaClaseModeloData();
        const mergedData = [...generatedData, ...sheetData];

        setProcessedData(mergedData);
        setIsProcessingComplete(true);
      };
      reader.readAsArrayBuffer(fileBlob);

      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 1
            ? { ...step, status: "completed" }
            : index === 2
            ? { ...step, status: "completed" }
            : step
        )
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to process the PDF.");
      setSteps((prevSteps) =>
        prevSteps.map((step, index) =>
          index === 1 || index === 2 ? { ...step, status: "error" } : step
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Convertidor de Datos (PDF a Excel)</h1>
      <StepIndicator steps={steps} />
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={handleUpload}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isLoading ? "Processing..." : "Convert PDF to Excel"}
      </button>
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="output.xlsx"
          className="mt-4 text-blue-600 underline"
        >
          Descargar archivo Excel
        </a>
      )}
      {isProcessingComplete && processedData.length > 0 && (
        <div className="mt-8 w-full">
          <h2 className="text-xl font-bold mb-4">Datos Procesados</h2>
          <BaseTableManager rows={processedData} setRows={setProcessedData} />
        </div>
      )}
    </div>
  );
};

export default PDFUploader;
