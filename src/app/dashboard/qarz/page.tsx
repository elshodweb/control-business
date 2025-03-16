"use client";
import React, { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";
import CustomTable from "@/components/Table/Table";
import Title from "@/components/Title/Title";
import Modal from "@/components/Modal/Modal";
import { RootState, AppDispatch } from "@/store/store";
import { fetchDebts } from "@/features/debt/debt";
import styles from "./styles.module.scss";
import AddBtn from "@/components/Buttons/AddBtn/AddBtn";
import MyPagination from "@/components/Pagination/Pagination";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import { fetchUsers } from "@/features/users/users";
import Loader from "@/components/Loader/Loader";
import UserModalForm from "@/components/UserModalForm/UserModalForm";
import { FaSearch } from "react-icons/fa";

const Alert = forwardRef<HTMLDivElement, React.ComponentProps<typeof MuiAlert>>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

const DebtPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { debts, pagination, status, error } = useSelector(
    (state: RootState) => state.debts
  );
  const { users } = useSelector((state: RootState) => state.users);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // UI state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [pageSize, setPageSize] = useState(10);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    user_id: "",
    comment: "",
    dayToBeGiven: "",
    dayGiven: "",
    remaining_debt: "",
    isActive: false,
  });

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Initial data load and when search changes
  useEffect(() => {
    dispatch(
      fetchDebts({
        pageNumber: 1,
        pageSize,
        search: debouncedSearch,
      })
    );
    dispatch(fetchUsers({ pageNumber: 1, pageSize: 200, search: "" }));
  }, [dispatch, pageSize, debouncedSearch]);

  // Set user for form
  const setUser = (id: string) => {
    dispatch(fetchUsers({ pageNumber: 1, pageSize: 200, search: "" }));
    setFormData({ ...formData, user_id: id });
  };

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDebt) return;

    try {
      const response = await axiosInstance.delete(
        `/debt/delete/${selectedDebt.id}`
      );

      if (response.status < 300) {
        dispatch(
          fetchDebts({
            pageNumber: 1,
            pageSize,
            search: debouncedSearch,
          })
        );
        setIsConfirmDeleteOpen(false);
        showSnackbar("Qarz muvaffaqiyatli o'chirildi", "success");
      } else {
        showSnackbar("Qarzni o'chirib bo'lmadi", "error");
      }
    } catch (error) {
      showSnackbar("Qarzni o'chirishda xatolik yuz berdi", "error");
    }
  };

  const handleUpdate = (debt: any) => {
    setIsEditMode(true);
    setSelectedDebt(debt);

    setFormData({
      user_id: debt?.user_id?.id || "",
      comment: debt?.comment || "",
      dayGiven: debt?.dayGiven?.split("T")[0] || "",
      dayToBeGiven: debt?.dayToBeGiven?.split("T")[0] || "",
      isActive: debt?.isActive === "Faol" || debt?.isActive === true,
      remaining_debt: debt?.remaining_debt || "",
    });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setIsEditMode(false);
    setSelectedDebt(null);
    setFormData({
      user_id: "",
      comment: "",
      dayGiven: "",
      dayToBeGiven: "",
      isActive: false,
      remaining_debt: "",
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const endpoint = isEditMode
      ? `/debt/update/${selectedDebt.id}`
      : "/debt/create";

    try {
      const response = await axiosInstance({
        method: isEditMode ? "patch" : "post",
        url: endpoint,
        data: { ...formData, isActive: "" + formData.isActive },
      });

      if (response.status >= 200 && response.status < 300) {
        dispatch(
          fetchDebts({
            pageNumber: 1,
            pageSize,
            search: debouncedSearch,
          })
        );
        setIsModalOpen(false);
        showSnackbar(
          isEditMode
            ? "Qarz muvaffaqiyatli yangilandi"
            : "Qarz muvaffaqiyatli yaratildi",
          "success"
        );
      } else {
        showSnackbar("Qarzni saqlashda xatolik yuz berdi", "error");
      }
    } catch (error) {
      showSnackbar("Qarzni saqlashda xatolik yuz berdi", "error");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <Title>Qarzlar</Title>
        <div className={styles.right}>
          <AddBtn onClick={handleCreate} />

          {/* Search input field */}
          <div className={styles.searchContainer}>
            <TextField
              variant="outlined"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch />
                  </InputAdornment>
                ),
              }}
              className={styles.searchInput}
            />
          </div>
        </div>
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

      {status === "loading" && <Loader />}
      {status === "failed" && <p>Error: {error}</p>}
      {status === "succeeded" && (
        <>
          <CustomTable
            keys={[
              "user_name",
              "user_phone",
              "remaining_debt",
              "comment",
              "isActive",
              "dayGiven",
              "dayToBeGiven",
            ]}
            titles={[
              "Foydalanuvchi",
              "F. Telefoni",
              "Qolgan Qarz",
              "Izoh",
              "Faol",
              "Berilgan Sana",
              "Qaytarish Sanasi",
            ]}
            data={debts.map((debt) => ({
              ...debt,
              user_name: debt.user_id
                ? `${debt.user_id.first_name || ""} ${debt.user_id.name || ""}`
                : "Foydalanuvchi yo'q",
              isActive: debt.isActive ? "Faol" : "Faol emas",
              user_phone: debt.user_id
                ? debt.user_id.phone || "Telefon yo'q"
                : "Telefon yo'q",
            }))}
            onDelete={(debt) => {
              setSelectedDebt(debt);
              setIsConfirmDeleteOpen(true);
            }}
            onUpdate={handleUpdate}
          />

          <MyPagination
            currentPage={pagination.currentPage}
            onPageChange={(event, page) => {
              dispatch(
                fetchDebts({
                  pageNumber: page,
                  pageSize,
                  search: debouncedSearch,
                })
              );
            }}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={pagination.totalPages}
          />

          {/* Modal for Create and Update */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={isEditMode ? "Qarzni tahrirlash" : "Qarz yaratish"}
          >
            <form onSubmit={handleFormSubmit}>
              {/* Qolgan qarz */}
              <TextField
                label="Qolgan qarz"
                value={formData.remaining_debt}
                onChange={(e) =>
                  setFormData({ ...formData, remaining_debt: e.target.value })
                }
                required
                fullWidth
                margin="normal"
              />

              {/* Izoh */}
              <TextField
                label="Izoh"
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                required
                fullWidth
                margin="normal"
              />

              {/* Berilgan sana */}
              <TextField
                label="Berilgan sana"
                type="date"
                value={formData.dayGiven}
                onChange={(e) =>
                  setFormData({ ...formData, dayGiven: e.target.value })
                }
                required
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              {/* Qaytarish Sanasi */}
              <TextField
                label="Qaytarish Sanasi"
                type="date"
                value={formData.dayToBeGiven}
                onChange={(e) =>
                  setFormData({ ...formData, dayToBeGiven: e.target.value })
                }
                fullWidth
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
              />

              {/* Faollik holati */}
              <FormControl fullWidth margin="normal">
                <InputLabel id="isActive-label">Faollik holati</InputLabel>
                <Select
                  labelId="isActive-label"
                  value={formData.isActive ? "true" : "false"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isActive: e.target.value === "true",
                    })
                  }
                  required
                  label="Faollik holati"
                >
                  <MenuItem value="true">Faol</MenuItem>
                  <MenuItem value="false">Faol emas</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth margin="normal">
                <InputLabel id="users-label">Foydalanuvchi</InputLabel>
                <Select
                  labelId="users-label"
                  value={formData.user_id}
                  onChange={(e) =>
                    setFormData({ ...formData, user_id: e.target.value })
                  }
                  label="Foydalanuvchi"
                  required
                >
                  {users.map((user, i) => (
                    <MenuItem key={i} value={user.id}>
                      {user.name || ""} {user.last_name || ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <UserModalForm getIdUser={setUser} />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ marginTop: 2 }}
              >
                {isEditMode ? "Saqlash" : "Yaratish"}
              </Button>
            </form>
          </Modal>

          {/* Confirmation Modal */}
          <Modal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            title="O'chirishni Tasdiqlash"
          >
            <p>Ushbu qarzni o'chirishga ishonchingiz komilmi?</p>
            <button onClick={handleDelete}>Ha, O'chirish</button>
            <button onClick={() => setIsConfirmDeleteOpen(false)}>
              Bekor qilish
            </button>
          </Modal>
        </>
      )}
    </div>
  );
};

export default DebtPage;
