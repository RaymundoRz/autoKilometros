import React from "react";
import { LinearProgress, Typography, Box } from "@mui/material";

const EnhancedProgressBar = ({ progress, statusMessage }) => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" width="100%">
      <Typography variant="body1" style={{ marginBottom: "0.5rem" }}>
        {statusMessage || "Procesando..."}
      </Typography>
      <Box width="100%">
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Typography
        variant="body2"
        style={{ marginTop: "0.5rem", color: "#888" }}
      >
        {progress.toFixed(0)}%
      </Typography>
    </Box>
  );
};

export default EnhancedProgressBar;
