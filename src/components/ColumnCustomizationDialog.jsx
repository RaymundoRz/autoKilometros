import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

const ColumnCustomizationDialog = ({ open, onClose, headers, onSave }) => {
  const [columnWidths, setColumnWidths] = useState({});
  const [cellStyles, setCellStyles] = useState({});

  const handleWidthChange = (header, value) => {
    setColumnWidths((prev) => ({
      ...prev,
      [header]: value,
    }));
  };

  const handleStyleChange = (header, value) => {
    setCellStyles((prev) => ({
      ...prev,
      [header]: value,
    }));
  };

  const handleSave = () => {
    onSave(columnWidths, cellStyles);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Personalizar Columnas</DialogTitle>
      <DialogContent>
        {headers.map((header) => (
          <div key={header} style={{ marginBottom: "1rem" }}>
            <TextField
              label={`Ancho de ${header}`}
              type="number"
              fullWidth
              value={columnWidths[header] || ""}
              onChange={(e) => handleWidthChange(header, e.target.value)}
              style={{ marginBottom: "0.5rem" }}
            />
            <FormControl fullWidth>
              <InputLabel>Estilo de {header}</InputLabel>
              <Select
                value={cellStyles[header] || ""}
                onChange={(e) => handleStyleChange(header, e.target.value)}
              >
                <MenuItem value="left">Alinear a la Izquierda</MenuItem>
                <MenuItem value="center">Centrar</MenuItem>
                <MenuItem value="right">Alinear a la Derecha</MenuItem>
              </Select>
            </FormControl>
          </div>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSave} color="primary">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnCustomizationDialog;
