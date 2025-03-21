"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import styles from "./CarServiceModalForm.module.scss";
import { FaCar, FaPlus } from "react-icons/fa";

interface CarServiceModalFormProps {
  addCarService: (carService: any) => void;
}

const CarServiceModalForm: React.FC<CarServiceModalFormProps> = ({
  addCarService,
}) => {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setPrice("");
    setComment("");
  };

  const handleSubmit = () => {
    if (price.trim() === "") {
      showSnackbar("Iltimos, narxni kiriting", "error");
      return;
    }

    const carService = {
      price,
      comment,
    };

    addCarService(carService);
    showSnackbar("Mashina xizmati qo'shildi", "success");
    handleClose();
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        <Button
          onClick={handleOpen}
          variant="contained"
          color="primary"
          className={styles.addCarButton}
        >
          <FaCar size={18} style={{ marginRight: "8px" }} />
          Mashina qo'shish
        </Button>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="car-service-modal-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 400,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 3,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h5"
            id="car-service-modal-title"
            className={styles.modalTitle}
          >
            Mashina xizmati qo'shish
          </Typography>

          <div className={styles.modalContent}>
            <div className={styles.formRow}>
              <TextField
                label="Narx *"
                variant="outlined"
                size="small"
                fullWidth
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                required
              />
            </div>

            <div className={styles.formRow}>
              <TextField
                label="Izoh"
                variant="outlined"
                size="small"
                fullWidth
                multiline
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className={styles.actions}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                <FaPlus size={16} style={{ marginRight: "8px" }} />
                Qo'shish
              </Button>
              <Button variant="outlined" onClick={handleClose}>
                Bekor qilish
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default CarServiceModalForm;
