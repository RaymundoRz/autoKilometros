import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress,
} from "@mui/material";
import ColumnCustomizationDialog from "./ColumnCustomizationDialog";

const XLSXPreviewModal = ({
  open,
  onClose,
  data,
  headers,
  onConfirm,
  isProcessing,
  progress,
  progressMessage,
}) => {
  const [customizationOpen, setCustomizationOpen] = useState(false); // Estado para abrir/ cerrar ColumnCustomizationDialog
  const [columnWidths, setColumnWidths] = useState({});
  const [cellStyles, setCellStyles] = useState({});

  const handleOpenCustomization = () => {
    setCustomizationOpen(true);
  };

  const handleCloseCustomization = () => {
    setCustomizationOpen(false);
  };

  const handleSaveCustomizations = (widths, styles) => {
    setColumnWidths(widths);
    setCellStyles(styles);
    setCustomizationOpen(false);
    console.log("Anchos personalizados:", widths);
    console.log("Estilos personalizados:", styles);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Vista Previa del Archivo XLSX</DialogTitle>
      <DialogContent>
        {isProcessing && (
          <>
            <LinearProgress
              variant="determinate"
              value={progress}
              style={{ marginBottom: 10 }}
            />
            <Typography variant="body2" color="textSecondary">
              {progressMessage || "Procesando..."}
            </Typography>
          </>
        )}
        {!isProcessing && data.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell
                    key={index}
                    style={{
                      width: columnWidths[header] || "auto",
                      textAlign: cellStyles[header] || "left",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice(0, 10).map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, colIndex) => (
                    <TableCell
                      key={colIndex}
                      style={{
                        textAlign: cellStyles[header] || "left",
                      }}
                    >
                      {row[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isProcessing && data.length === 0 && (
          <Typography variant="body1" style={{ marginTop: 20 }}>
            No hay datos disponibles para mostrar.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        {/* Botón para abrir el diálogo de personalización */}
        <Button
          onClick={handleOpenCustomization}
          color="primary"
          disabled={isProcessing || data.length === 0}
        >
          Personalizar Columnas
        </Button>
        <Button onClick={onClose} color="secondary" disabled={isProcessing}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="primary"
          disabled={isProcessing || data.length === 0}
        >
          Confirmar y Descargar
        </Button>
      </DialogActions>

      {/* Diálogo de personalización */}
      <ColumnCustomizationDialog
        open={customizationOpen}
        onClose={handleCloseCustomization}
        headers={headers}
        onSave={handleSaveCustomizations}
      />
    </Dialog>
  );
};

export default XLSXPreviewModal;
