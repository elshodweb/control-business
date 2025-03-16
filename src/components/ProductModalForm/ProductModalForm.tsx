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
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import styles from "./ProductModalForm.module.scss";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { FaPlus, FaBox } from "react-icons/fa";
import { fetchProducts } from "@/features/products/products";
import { fetchProductCategories } from "@/features/productCategory/productCategorySlice";

interface ProductModalFormProps {
  addProduct: (product: any) => void;
}

const ProductModalForm: React.FC<ProductModalFormProps> = ({ addProduct }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [unusedDays, setUnusedDays] = useState(0);
  const [comment, setComment] = useState("");
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(0);

  const { products } = useSelector((state: RootState) => state.products);
  const { categories } = useSelector(
    (state: RootState) => state.productCategories
  );

  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [isMobile, setIsMobile] = useState(false);

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

  // Load categories and products when modal opens
  const handleOpen = () => {
    setOpen(true);
    dispatch(
      fetchProductCategories({
        pageNumber: 1,
        pageSize: 100,
        title: "",
      }) as any
    );
    dispatch(
      fetchProducts({
        pageNumber: 1,
        pageSize: 100,
        searchTitle: "",
        category_id: "null",
        searchable_title_id: "",
      }) as any
    );
  };

  // Filter products when category changes
  useEffect(() => {
    if (products && products.length > 0) {
      let filtered = [...products];

      // Filter by category if selected
      if (selectedCategory) {
        filtered = filtered.filter(
          (product) => product.category_id?.id === selectedCategory.id
        );
      }

      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory]);

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedProduct(null);
    setQuantity(1);
    setRentalDays(1);
    setStartDate("");
    setEndDate("");
    setUnusedDays(0);
    setComment("");
    setHasDiscount(false);
    setDiscountPrice(0);
  };

  const handleCategoryChange = (_: any, value: any) => {
    setSelectedCategory(value);
    setSelectedProduct(null);
  };

  const handleProductChange = (event: any) => {
    const productId = event.target.value;
    const product = products.find((p) => p.id === productId);
    setSelectedProduct(product);
    if (product) {
      setDiscountPrice(product.price);
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setStartDate(date);

    if (endDate) {
      const start = new Date(date);
      const end = new Date(endDate);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
      );
      if (days > 0) {
        setRentalDays(days);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setEndDate(date);

    if (startDate) {
      const start = new Date(startDate);
      const end = new Date(date);
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
      );
      if (days > 0) {
        setRentalDays(days);
      }
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      showSnackbar("Iltimos, mahsulotni tanlang", "error");
      return;
    }

    if (!startDate || !endDate) {
      showSnackbar("Iltimos, sanalarni kiriting", "error");
      return;
    }

    // Calculate prices
    const dailyPrice = hasDiscount
      ? discountPrice * quantity
      : selectedProduct.price * quantity;

    const totalPrice = dailyPrice * rentalDays;

    const product = {
      selectedCategory,
      categoryTitle: selectedCategory?.title || "",
      selectedProduct,
      productTitle: selectedProduct?.title || "",
      quantity,
      rentalDays,
      totalPrice,
      dailyPrice,
      type: selectedProduct.type,
      price: selectedProduct.price,
      startDate,
      endDate,
      unusedDays,
      comment,
      hasDiscount,
      discountPrice: hasDiscount ? discountPrice : selectedProduct.price,
    };

    addProduct(product);
    showSnackbar("Mahsulot qo'shildi", "success");
    resetForm();
    setOpen(false);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const calculateTotalPrice = () => {
    if (!selectedProduct) return 0;

    const pricePerUnit = hasDiscount ? discountPrice : selectedProduct.price;
    return pricePerUnit * quantity * rentalDays;
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        <Button
          onClick={handleOpen}
          variant="contained"
          color="primary"
          className={styles.addProductButton}
        >
          <FaBox size={18} style={{ marginRight: "8px" }} />
          Mahsulot qo'shish
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
        aria-labelledby="product-modal-title"
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
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Typography
            variant="h5"
            id="product-modal-title"
            className={styles.modalTitle}
          >
            Mahsulot qo'shish
          </Typography>

          <div className={styles.modalContent}>
            <div className={styles.formRow}>
              <div className={styles.formColumn}>
                <Typography variant="subtitle2">Kategoriya</Typography>
                <Autocomplete
                  size="small"
                  options={categories || []}
                  onChange={handleCategoryChange}
                  value={selectedCategory}
                  getOptionLabel={(option) => option.title || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value?.id
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Kategoriya"
                      variant="outlined"
                    />
                  )}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formColumn}>
                <Typography variant="subtitle2">Mahsulot</Typography>
                <FormControl fullWidth size="small">
                  <InputLabel>Mahsulotni tanlang</InputLabel>
                  <Select
                    value={selectedProduct?.id || ""}
                    onChange={handleProductChange}
                    label="Mahsulotni tanlang"
                  >
                    {filteredProducts.map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.title} ({product.searchable_title_id})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>

            {selectedProduct && (
              <>
                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">
                      {selectedProduct.type === "dona" ? "Dona" : "Metr"} narxi
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={selectedProduct.price}
                      disabled
                    />
                  </div>

                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">Miqdor</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) setQuantity(val);
                      }}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">
                      Boshlanish sanasi
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                    />
                  </div>

                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">Tugash sanasi</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="date"
                      value={endDate}
                      onChange={handleEndDateChange}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">Kunlar soni</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={rentalDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val > 0) setRentalDays(val);
                      }}
                    />
                  </div>

                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">
                      Ishlatilmagan kunlar
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      type="number"
                      value={unusedDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 0) setUnusedDays(val);
                      }}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formColumn}>
                    <Typography variant="subtitle2">Izoh</Typography>
                    <TextField
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.checkboxColumn}>
                    <FormControl component="fieldset">
                      <label>
                        <input
                          type="checkbox"
                          checked={hasDiscount}
                          onChange={(e) => {
                            setHasDiscount(e.target.checked);
                            if (!e.target.checked) {
                              setDiscountPrice(selectedProduct.price);
                            }
                          }}
                        />
                        <span>Chegirma qo'shish</span>
                      </label>
                    </FormControl>
                  </div>
                </div>

                {hasDiscount && (
                  <div className={styles.formRow}>
                    <div className={styles.formColumn}>
                      <Typography variant="subtitle2">
                        Chegirma narxi
                      </Typography>
                      <TextField
                        size="small"
                        fullWidth
                        type="number"
                        value={discountPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (val >= 0) setDiscountPrice(val);
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.summaryRow}>
                  <Typography variant="subtitle1">
                    <strong>Kunlik narx:</strong>{" "}
                    {(hasDiscount ? discountPrice : selectedProduct.price) *
                      quantity}{" "}
                    so'm
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Jami narx:</strong> {calculateTotalPrice()} so'm
                  </Typography>
                </div>
              </>
            )}

            <div className={styles.actions}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddProduct}
                disabled={!selectedProduct}
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

export default ProductModalForm;
