import React, { useState } from "react";
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const BaseTableManager = ({ rows, setRows }) => {
    const [newRow, setNewRow] = useState({ km: "", hasta: "", clase: "", modelo: "", cantidad: "" });
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewRow({ ...newRow, [name]: value });
    };
  
    const addRow = () => {
      if (Object.values(newRow).some((value) => value === "")) {
        alert("Todos los campos deben estar llenos.");
        return;
      }
  
      setRows([...rows, newRow]);
      setNewRow({ km: "", hasta: "", clase: "", modelo: "", cantidad: "" });
    };
  
    const removeLastRow = () => {
      if (rows.length === 0) {
        alert("No hay filas para eliminar.");
        return;
      }
  
      setRows(rows.slice(0, -1));
    };
  
    return (
      <div>
        <h1>Gestión de Tabla Base</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <TextField
            label="Km"
            name="km"
            value={newRow.km}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            label="Hasta"
            name="hasta"
            value={newRow.hasta}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            label="Clase"
            name="clase"
            value={newRow.clase}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            label="Modelo"
            name="modelo"
            value={newRow.modelo}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            label="Cantidad"
            name="cantidad"
            value={newRow.cantidad}
            onChange={handleInputChange}
            variant="outlined"
          />
          <Button variant="contained" onClick={addRow}>
            Añadir
          </Button>
          <Button variant="outlined" color="error" onClick={removeLastRow}>
            Eliminar última fila
          </Button>
        </div>
  
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Km</TableCell>
                <TableCell>Hasta</TableCell>
                <TableCell>Clase</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {(Array.isArray(rows) ? rows : []).map((row, index) => (
    <TableRow key={index}>
      <TableCell>{row.Km}</TableCell>
      <TableCell>{row.Hasta}</TableCell>
      <TableCell>{row.Clase}</TableCell>
      <TableCell>{row.Modelo}</TableCell>
      <TableCell>{row.Cantidad}</TableCell>
    </TableRow>
  ))}
</TableBody>


          </Table>
        </TableContainer>
      </div>
    );
  };
  
  export default BaseTableManager;
  