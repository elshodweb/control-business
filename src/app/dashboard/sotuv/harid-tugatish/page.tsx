"use client";
import React, { forwardRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "@/utils/axiosInstance";
import TableForOrders from "@/components/TableForOrders/TableForOrders";
import Title from "@/components/Title/Title";
import { RootState, AppDispatch } from "@/store/store";
import { fetchOrdersWithFilter } from "@/features/order/orderWithFilter";
import styles from "./styles.module.scss";
import MyPagination from "@/components/Pagination/Pagination";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import Loader from "@/components/Loader/Loader";
import Search from "@/components/Search/Search";
import {
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import Modal from "@/components/Modal/Modal";
import { format } from "date-fns";

const Alert = forwardRef<HTMLDivElement, React.ComponentProps<typeof MuiAlert>>(
  function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  }
);

const OrderPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { orders, status, error, pagination } = useSelector(
    (state: RootState) => state.ordersWithFilter
  );
  const [search, setSearch] = useState("");
  const [id, setId] = useState("");
  const [nomer, setNomer] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  const [pageSize, setPageSize] = useState(10);

  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [startDate, setStartDate] = useState<string | undefined>(undefined);
  const [endDate, setEndDate] = useState<string | undefined>(undefined);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDebt, setIsDebt] = useState<boolean>(false);
  const [debt, setDebt] = useState<any>({
    remaining_debt: null,
    comment: null,
    isActive: "true",
    dayToBeGiven: null,
    dayGiven: format(new Date(), "yyyy-MM-dd"),
  });

  async function handleDelete() {
    try {
      const response = await axiosInstance.patch(
        `/order/update-status/${selectedOrder.id}`,
        {
          status: "false",
          debts: {
            remaining_debt: debt.remaining_debt?.length
              ? debt.remaining_debt
              : null,
            comment: debt.comment?.length ? debt.comment : null,
            isActive: "true",
            dayToBeGiven: debt.dayToBeGiven?.length ? debt.dayToBeGiven : null,
            dayGiven: debt.dayGiven?.length
              ? debt.dayGiven
              : format(new Date(), "yyyy-MM-dd"),
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        dispatch(
          fetchOrdersWithFilter({
            title: "",
            pageNumber: 1,
            pageSize,
            isActive,
            nomer,
            name,
            startDate,
            endDate,
          })
        );
        showSnackbar("Order successfully deleted", "success");
      } else {
        showSnackbar("Failed to delete order", "error");
      }
    } catch (error) {
      showSnackbar("Error occurred while deleting order", "error");
    } finally {
      setDebt({
        remaining_debt: null,
        comment: null,
        isActive: "true",
        dayToBeGiven: null,
        dayGiven: format(new Date(), "yyyy-MM-dd"),
      });
    }
    setSelectedOrder(null);
    setIsConfirmDeleteOpen(false);
  }
  useEffect(() => {
    dispatch(
      fetchOrdersWithFilter({
        title: "",
        pageNumber: 1,
        pageSize,
        isActive,
        nomer,
        name,
        startDate,
        endDate,
      })
    );
  }, [dispatch, pageSize, isActive, startDate, endDate]);

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

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.title}>
          <Title>Buyurymalar</Title>
        </div>
        <div className={styles.navRight}>
          <div className={styles.datePicker}>
            <label>Boshlanish sanasi:</label>
            <input
              type="date"
              value={startDate || ""}
              onChange={(e) => setStartDate(e.target.value || undefined)}
            />
          </div>
          <div className={styles.datePicker}>
            <label>Tugash sanasi:</label>
            <input
              type="date"
              value={endDate || ""}
              onChange={(e) => setEndDate(e.target.value || undefined)}
            />
          </div>

          <FormControl size="small" className={styles.select} fullWidth>
            <InputLabel id="is-active-label">Holatini tanlang</InputLabel>
            <Select
              labelId="is-active-label"
              value={isActive !== undefined ? isActive.toString() : ""}
              onChange={(e) =>
                setIsActive(
                  e.target.value === "" ? undefined : e.target.value === "true"
                )
              }
              label="Holatini tanlang"
            >
              <MenuItem value="">Barchasi</MenuItem>
              <MenuItem value="true">Faol</MenuItem>
              <MenuItem value="false">Faol emas</MenuItem>
            </Select>
          </FormControl>

          <Search
            onChange={(e) => {
              const value = e.target.value;
              if (value == "") {
                dispatch(
                  fetchOrdersWithFilter({
                    title: "",
                    pageNumber: 1,
                    pageSize,
                    isActive,
                    nomer,
                    name,
                    startDate,
                    endDate,
                  })
                );
              }
              if (!isNaN(parseFloat(value))) {
                setNomer(value); // Use as phone number or ID
                setName(""); // Clear name search
              } else {
                setName(value); // Use as name
                setNomer(""); // Clear phone number search
              }
              setSearch(value);
            }}
            placeholder="Qidirish (Nomi, Telefon)"
            onClick={() => {
              dispatch(
                fetchOrdersWithFilter({
                  title: "",
                  pageNumber: 1,
                  pageSize,
                  isActive,
                  nomer,
                  name,
                  startDate,
                  endDate,
                })
              );
            }}
            search={search}
          />
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

      {status === "loading" && (
        <div>
          <Loader />
        </div>
      )}
      {status === "failed" && <p>Error: {error}</p>}
      {status === "succeeded" && (
        <>
          <TableForOrders
            data={orders}
            onUpdate={() => {}}
            onDelete={async (order) => {
              setIsConfirmDeleteOpen(true);
              setSelectedOrder(order);
            }}
          />
          <Modal
            isOpen={isConfirmDeleteOpen}
            onClose={() => setIsConfirmDeleteOpen(false)}
            title="Haridni yakunlash"
            className={styles.modal}
          >
            {selectedOrder && (
              <div className={styles.orderSummary}>
                <div className={styles.orderInfo}>
                  <h4 className={styles.sectionTitle}>Buyurtma ma'lumotlari</h4>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Mijoz:</span>
                    <span className={styles.value}>
                      {selectedOrder.user_id
                        ? `${selectedOrder.user_id.name || ""} ${
                            selectedOrder.user_id.first_name || ""
                          }`
                        : "Noma'lum"}
                    </span>
                  </div>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Telefon:</span>
                    <span className={styles.value}>
                      {selectedOrder.user_id?.phone || "Noma'lum"}
                    </span>
                  </div>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Umumiy narx:</span>
                    <span className={styles.value}>
                      {Number(selectedOrder.total_price).toLocaleString()} so'm
                    </span>
                  </div>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Kunlik narx:</span>
                    <span className={styles.value}>
                      {Number(selectedOrder.daily_price).toLocaleString()} so'm
                    </span>
                  </div>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Buyurtma sanasi:</span>
                    <span className={styles.value}>
                      {new Date(selectedOrder.create_data).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.orderInfoRow}>
                    <span className={styles.label}>Izoh:</span>
                    <span className={styles.value}>
                      {selectedOrder.comment || "-"}
                    </span>
                  </div>
                </div>

                {selectedOrder.orderProducts &&
                  selectedOrder.orderProducts.length > 0 && (
                    <div className={styles.productsSection}>
                      <h4 className={styles.sectionTitle}>Mahsulotlar</h4>
                      {selectedOrder.orderProducts.map(
                        (product: any, index: number) => (
                          <div key={product.id} className={styles.productItem}>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>Mahsulot:</span>
                              <span className={styles.value}>
                                {product.product_id?.title || "Noma'lum"}
                              </span>
                            </div>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>Miqdor:</span>
                              <span className={styles.value}>
                                {product.quantity_sold}
                              </span>
                            </div>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>O'lchov:</span>
                              <span className={styles.value}>
                                {product.measurement_sold}
                              </span>
                            </div>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>Kunlik narx:</span>
                              <span className={styles.value}>
                                {Number(product.price_per_day).toLocaleString()}{" "}
                                so'm
                              </span>
                            </div>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>
                                Boshlanish sanasi:
                              </span>
                              <span className={styles.value}>
                                {product.given_date}
                              </span>
                            </div>
                            <div className={styles.productInfoRow}>
                              <span className={styles.label}>
                                Tugash sanasi:
                              </span>
                              <span className={styles.value}>
                                {product.end_date}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}

                {selectedOrder.carServices &&
                  selectedOrder.carServices.length > 0 && (
                    <div className={styles.servicesSection}>
                      <h4 className={styles.sectionTitle}>Xizmatlar</h4>
                      {selectedOrder.carServices.map(
                        (service: any, index: number) => (
                          <div key={service.id} className={styles.serviceItem}>
                            <div className={styles.serviceInfoRow}>
                              <span className={styles.label}>Narx:</span>
                              <span className={styles.value}>
                                {service.price}
                              </span>
                            </div>
                            <div className={styles.serviceInfoRow}>
                              <span className={styles.label}>Izoh:</span>
                              <span className={styles.value}>
                                {service.comment || "-"}
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            )}

            <p>Haqiqatan ham ushbu haridni yakunlashni istaysizmi?</p>
            <div className={styles.debtCheckbox}>
              <Checkbox onChange={() => setIsDebt(!isDebt)} checked={isDebt} />
              <span>Qarz qoldirish</span>
            </div>

            {isDebt && (
              <div className={styles.debt}>
                <label>Qarz qoldirilgan summa:</label>
                <TextField
                  className={styles.input}
                  fullWidth={true}
                  type="number"
                  size="small"
                  value={debt.remaining_debt || ""}
                  onChange={(e) =>
                    setDebt({ ...debt, remaining_debt: e.target.value })
                  }
                />
                <label>Qarz qoldirish kuni:</label>
                <TextField
                  className={styles.input}
                  fullWidth={true}
                  type="date"
                  size="small"
                  value={debt.dayToBeGiven || ""}
                  onChange={(e) =>
                    setDebt({ ...debt, dayToBeGiven: e.target.value })
                  }
                />
                <label>Qarz qoldirilgan kun:</label>
                <TextField
                  className={styles.input}
                  fullWidth={true}
                  type="date"
                  size="small"
                  value={debt.dayGiven || ""}
                  onChange={(e) =>
                    setDebt({ ...debt, dayGiven: e.target.value })
                  }
                />
                <label>Izoh:</label>
                <TextField
                  className={styles.input}
                  fullWidth={true}
                  type="text"
                  size="small"
                  multiline
                  rows={2}
                  value={debt.comment || ""}
                  onChange={(e) =>
                    setDebt({ ...debt, comment: e.target.value })
                  }
                />
              </div>
            )}
            <div className={styles.modalActions}>
              <button className={styles.button} onClick={handleDelete}>
                Ha
              </button>
              <button
                className={styles.button}
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                Yo'q
              </button>
            </div>
          </Modal>

          <MyPagination
            currentPage={pagination.currentPage}
            onPageChange={(event, page) => {
              dispatch(
                fetchOrdersWithFilter({
                  title: "",
                  pageNumber: page,
                  pageSize,
                  isActive,
                  nomer,
                  name,
                  startDate,
                  endDate,
                })
              );
            }}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={pagination.totalPages}
          />
        </>
      )}
    </div>
  );
};

export default OrderPage;
