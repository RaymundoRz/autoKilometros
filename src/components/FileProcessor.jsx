import React, { useState } from "react";
import XLSXPreviewModal from "./XLSXPreviewModal";
import { Button } from "@mui/material";

const FileProcessor = ({ setProcessedData, setProcessedHeaders }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Estado de procesamiento
  const [progress, setProgress] = useState(0); // Porcentaje de progreso
  const [progressMessage, setProgressMessage] = useState(""); // Mensaje de progreso
  const [data, setData] = useState([]); // Datos simulados
  const [headers, setHeaders] = useState([]); // Encabezados simulados

  const handleOpenModal = () => {
    setModalOpen(true);
    processFile();
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const processFile = () => {
    setIsProcessing(true);
    setProgress(0);
    setProgressMessage("Inicializando procesamiento...");

    const steps = [
      { message: "Leyendo archivo PDF...", progress: 20 },
      { message: "Procesando página 1...", progress: 40 },
      { message: "Procesando página 2...", progress: 60 },
      { message: "Generando datos...", progress: 80 },
      { message: "Completando proceso...", progress: 100 },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setProgressMessage(step.message);

        if (index === steps.length - 1) {
          const simulatedHeaders = ["Columna1", "Columna2", "Columna3"];
          const simulatedData = [
            { Columna1: "Dato1", Columna2: "Dato2", Columna3: "Dato3" },
            { Columna1: "Dato4", Columna2: "Dato5", Columna3: "Dato6" },
          ];
          setHeaders(simulatedHeaders);
          setData(simulatedData);
          setProcessedHeaders(simulatedHeaders); // Actualizar headers en el componente padre
          setProcessedData(simulatedData); // Actualizar datos en el componente padre
          setIsProcessing(false);
        }
      }, (index + 1) * 1000);
    });
  };

  const handleConfirm = () => {
    console.log("Datos confirmados:", data);
    handleCloseModal();
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpenModal}>
        Procesar Archivo
      </Button>
      <XLSXPreviewModal
        open={modalOpen}
        onClose={handleCloseModal}
        data={data}
        headers={headers}
        onConfirm={handleConfirm}
        isProcessing={isProcessing}
        progress={progress}
        progressMessage={progressMessage}
      />
    </div>
  );
};

export default FileProcessor;
