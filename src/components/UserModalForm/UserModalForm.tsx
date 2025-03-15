"use client";
import React, { useState } from "react";
import {
  Modal,
  Box,
  Button,
  Autocomplete,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import styles from "./UserModalForm.module.scss";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { FaPlus, FaUserPlus } from "react-icons/fa";
import axiosInstance from "@/utils/axiosInstance";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "0px solid #000",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

interface UserModalFormProps {
  getIdUser: (id: string) => void;
}

const UserModalForm: React.FC<UserModalFormProps> = ({ getIdUser }) => {
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    comment: "",
  });
  const { users } = useSelector((state: RootState) => state.users);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

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
    const formData = new FormData();
    formData.append("name", newUser.name);
    formData.append("phone", newUser.phone);
    formData.append("comment", newUser.comment);

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
      } else {
        showSnackbar("Foydalanuvchini saqlashda xato", "error");
      }
    } catch (error) {
      showSnackbar("Foydalanuvchini saqlashda xatolik yuz berdi", "error");
    }
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="contained"
        color="primary"
        className={styles.userSelectButton}
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
        <Box sx={style}>
          <h2 id="user-modal-title">Foydalanuvchi tanlash</h2>
          <div className={styles.modalContent}>
            <div className={styles.userSelectSection}>
              <h3>Mavjud foydalanuvchilar</h3>
              <Autocomplete
                id="user-select-dropdown"
                options={users}
                getOptionLabel={(option: any) =>
                  `${option.name || "Без имени"} (${
                    option.phone || "Нет телефона"
                  })`
                }
                onChange={(event, value) => setSelectedUser(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Foydalanuvchi"
                    variant="outlined"
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
              <TextField
                label="Ism"
                variant="outlined"
                fullWidth
                margin="dense"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
              <TextField
                label="Telefon"
                variant="outlined"
                fullWidth
                margin="dense"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
              />
              <TextField
                label="Izoh"
                variant="outlined"
                fullWidth
                margin="dense"
                multiline
                rows={2}
                value={newUser.comment}
                onChange={(e) =>
                  setNewUser({ ...newUser, comment: e.target.value })
                }
              />
              <TextField
                autoComplete="off"
                className={styles.autocompleteModal}
                size="small"
                fullWidth
                type="file"
                onChange={(e: any) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatar(file);
                  }
                }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCreateUser}
                fullWidth
                sx={{ mt: 2 }}
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
