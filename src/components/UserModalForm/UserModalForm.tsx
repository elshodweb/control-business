"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  Autocomplete,
  TextField,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import styles from "./UserModalForm.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaPlus, FaUserPlus } from "react-icons/fa";
import axiosInstance from "@/utils/axiosInstance";

interface UserModalFormProps {
  getIdUser: (id: string) => void;
}

const UserModalForm: React.FC<UserModalFormProps> = ({ getIdUser }) => {
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    name: "",
    phone: "",
    comment: "",
    role: "user", // Default role
    password: "", // Required password
  });
  const { users } = useSelector((state: RootState) => state.users);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isMobile, setIsMobile] = useState(false);

  // Ekran o'lchamini kuzatish uchun useEffect hook
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Dastlabki o'lchamni aniqlash
    checkIsMobile();

    // Ekran o'lchami o'zgarishini kuzatish
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelectUser = () => {
    if (selectedUser) {
      getIdUser(selectedUser.id);
      handleClose();
    }
  };

  const handleCreateUser = async () => {
    // API talab qilgan to'liq name fieldini yangilaymiz
    const updatedUser = {
      ...newUser,
      name: `${newUser.first_name} ${newUser.last_name}`.trim(),
    };

    const formData = new FormData();
    formData.append("first_name", updatedUser.first_name);
    formData.append("last_name", updatedUser.last_name);
    formData.append("name", updatedUser.name);
    formData.append("phone", updatedUser.phone);
    formData.append("comment", updatedUser.comment);
    formData.append("role", updatedUser.role);
    formData.append("password", updatedUser.password);

    if (avatar) {
      formData.append("image", avatar);
    }

    try {
      const response: any = await axiosInstance({
        method: "post",
        url: "/Auth/user/register",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status < 300) {
        showSnackbar("Foydalanuvchi muvaffaqiyatli qo'shildi", "success");
        getIdUser(response?.data?.user?.id);
        handleClose();

        // Formani tozalash
        setNewUser({
          first_name: "",
          last_name: "",
          name: "",
          phone: "",
          comment: "",
          role: "user",
          password: "",
        });
        setAvatar(null);
      } else {
        showSnackbar("Foydalanuvchini saqlashda xato", "error");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Xatolik yuz berdi";
      showSnackbar(
        Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage,
        "error"
      );
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        color="primary"
        className={styles.userSelectButton}
        fullWidth
      >
        <FaUserPlus size={18} style={{ marginRight: "8px" }} />
        Foydalanuvchi
      </Button>
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
        aria-labelledby="user-modal-title"
        aria-describedby="user-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: isMobile ? "95%" : 750,
            bgcolor: "background.paper",
            borderRadius: "8px",
            boxShadow: 24,
            p: 3,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 id="user-modal-title" className={styles.modalTitle}>
            Foydalanuvchi tanlash
          </h2>
          <div className={styles.modalContent}>
            <div className={styles.userSelectSection}>
              <h3>Mavjud foydalanuvchilar</h3>
              <Autocomplete
                id="user-select-dropdown"
                options={users}
                getOptionLabel={(option: any) =>
                  `${option.name || "Nomsiz"} (${
                    option.phone || "Telefon raqami yo'q"
                  })`
                }
                onChange={(event, value) => setSelectedUser(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Foydalanuvchi"
                    variant="outlined"
                    size="small"
                  />
                )}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSelectUser}
                fullWidth
                disabled={!selectedUser}
                sx={{ mt: 2 }}
              >
                Tanlash
              </Button>
            </div>

            <div className={styles.createUserSection}>
              <h3>Yangi foydalanuvchi</h3>
              <div className={styles.formGrid}>
                <TextField
                  label="Ism *"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={newUser.first_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, first_name: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Familiya *"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={newUser.last_name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, last_name: e.target.value })
                  }
                  required
                />
                <TextField
                  label="Telefon"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                />
                <TextField
                  label="Parol *"
                  type="password"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className={styles.formRow}>
                <FormControl fullWidth size="small">
                  <InputLabel id="role-select-label">Rol *</InputLabel>
                  <Select
                    labelId="role-select-label"
                    value={newUser.role}
                    label="Rol *"
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    required
                  >
                    <MenuItem value="user">Foydalanuvchi</MenuItem>
                    <MenuItem value="admin">Administrator</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <div className={styles.formRow}>
                <TextField
                  label="Izoh"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={2}
                  value={newUser.comment}
                  onChange={(e) =>
                    setNewUser({ ...newUser, comment: e.target.value })
                  }
                />
              </div>
              <div className={styles.fileUploadWrapper}>
                <label className={styles.fileLabel}>Rasm yuklash</label>
                <TextField
                  autoComplete="off"
                  className={styles.fileInput}
                  size="small"
                  fullWidth
                  type="file"
                  onChange={(e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatar(file);
                    }
                  }}
                  InputProps={{
                    inputProps: {
                      accept: "image/*",
                    },
                  }}
                />
              </div>
              <div className={styles.noteText}>* majburiy maydonlar</div>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateUser}
                fullWidth
                sx={{ mt: 2 }}
                disabled={
                  !newUser.first_name || !newUser.last_name || !newUser.password
                }
              >
                <FaPlus size={16} style={{ marginRight: "8px" }} />
                Yaratish
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default UserModalForm;
