import React from "react";
import { Box, Typography, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorIcon from "@mui/icons-material/Error";

const StepIndicator = ({ steps }) => {
  return (
    <Box>
      <Typography variant="h6" style={{ marginBottom: "1rem" }}>
        Progreso del Proceso
      </Typography>
      <List>
        {steps.map((step, index) => (
          <ListItem key={index}>
            <ListItemIcon>
              {step.status === "completed" && (
                <CheckCircleIcon style={{ color: "green" }} />
              )}
              {step.status === "in-progress" && (
                <HourglassEmptyIcon style={{ color: "orange" }} />
              )}
              {step.status === "error" && <ErrorIcon style={{ color: "red" }} />}
            </ListItemIcon>
            <ListItemText
              primary={step.label}
              secondary={step.description}
              style={{
                textDecoration:
                  step.status === "completed" ? "line-through" : "none",
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default StepIndicator;
