"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles.module.scss";
import Title from "@/components/Title/Title";
import {
  Autocomplete,
  TextField,
  Button,
  Snackbar,
  Alert,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState, store } from "@/store/store";
import { fetchUsers } from "@/features/users/users";
import { fetchProducts } from "@/features/products/products";
import { fetchProductCategories } from "@/features/productCategory/productCategorySlice";
import {
  FaBox,
  FaCar,
  FaCartPlus,
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { fetchCarServices } from "@/features/cars/cars";
import axiosInstance from "@/utils/axiosInstance";
import {
  ActionTypesEnum,
  DeliveryDetails,
  RentalDetails,
} from "../../../../../types";
import { useReactToPrint } from "react-to-print";
import UserDataSummary from "@/components/Check/Check";
import UserModalForm from "@/components/UserModalForm/UserModalForm";
import ProductModalForm from "@/components/ProductModalForm/ProductModalForm";
import ProductsTable from "@/components/ProductsTable/ProductsTable";
import CarServiceModalForm from "@/components/CarServiceModalForm/CarServiceModalForm";
import CarServicesTable from "@/components/CarServicesTable/CarServicesTable";

const Page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chackRef = useRef(null);
  const reactToPrintFn = useReactToPrint({
    contentRef: chackRef,
    onAfterPrint: () => setIsCheckVisible(false),
  });

  const handlePrint = () => {
    setIsCheckVisible(true);
    setTimeout(() => {
      reactToPrintFn();
    }, 100);
  };

  const {
    users,
    error: userError,
    status: userStatus,
  } = useSelector((state: RootState) => state.users);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [isCheckVisible, setIsCheckVisible] = useState(false);
  const { categories } = useSelector(
    (state: RootState) => state.productCategories
  );
  const { products } = useSelector((state: RootState) => state.products);
  const [originalProducts, setOriginalProducts] = useState<any[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
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

  const [sections, setSections] = useState<
    (RentalDetails & {
      hasDiscount: boolean;
      discountPrice: number;
    })[]
  >([
    {
      selectedCategory: null,
      comment: "",
      categoryTitle: "",
      selectedProduct: null,
      productTitle: "",
      quantity: 1,
      rentalDays: 1,
      totalPrice: 0,
      dailyPrice: 0,
      type: "",
      price: 0,
      startDate: "",
      endDate: "",
      unusedDays: 0,
      hasDiscount: false,
      discountPrice: 0,
    },
  ]);
  const { carServices, status, error } = useSelector(
    (state: RootState) => state.carServices
  );
  const [delivery, setDelivery] = useState<DeliveryDetails[]>([
    {
      comment: "",
      price: "",
    },
  ]);
  const [autocompleteProducts, setAutocompleteProducts] = useState(products);
  const [titleOrId, setTitleOrId] = useState("");

  useEffect(() => {
    dispatch(
      fetchUsers({
        pageNumber: 1,
        pageSize: 200,
        search: phone,
      })
    );
  }, [dispatch, phone]);
  const updateUnusedDays = (
    index: number,
    section: any,
    unusedDays: number
  ) => {
    if (section.selectedProduct) {
      const newSections = [...sections];
      newSections[index].unusedDays = unusedDays;
      setSections(newSections);
    }
  };
  const updateProducts = (
    index: number,
    categoryId: string | null,
    productTitle: string,
    searchableTitleId: string | null = null
  ) => {
    dispatch(
      fetchProducts({
        pageNumber: 1,
        pageSize: 100,
        searchTitle: productTitle,
        searchable_title_id: searchableTitleId || "null",
        category_id: categoryId || "null",
      })
    );
  };
  useEffect(() => {
    setAutocompleteProducts(products);
  }, [products]);

  useEffect(() => {
    dispatch(
      fetchProductCategories({
        pageNumber: 1,
        pageSize: 100,
        title: "",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        pageNumber: 1,
        pageSize: 100,
        searchTitle: "",
        category_id: "null",
        searchable_title_id: "",
      })
    ).then((response: any) => {
      if (response.payload) {
        setOriginalProducts(response.payload.results);
      }
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCarServices({
        pageNumber: 1,
        pageSize: 100,
        profit_or_expense: "null",
      })
    );
  }, [dispatch]);

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        selectedCategory: null,
        categoryTitle: "",
        selectedProduct: null,
        productTitle: "",
        quantity: 1,
        rentalDays: 1,
        totalPrice: 0,
        dailyPrice: 0,
        price: 0,
        type: "",
        startDate: "",
        endDate: "",
        unusedDays: 0,
        comment: "",
        hasDiscount: false,
        discountPrice: 0,
      },
    ]);
  };

  const handleAddDelivery = () => {
    setDelivery((prev) => [
      ...prev,
      {
        comment: "",
        price: "",
      },
    ]);
  };

  const handleRemoveSection = (index: number) => {
    if (sections.length > 1) {
      setSections((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleRemoveDelivery = (index: number) => {
    if (delivery.length > 0) {
      setDelivery((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleChangeCategory = (index: number, value: any) => {
    const newSections = [...sections];
    newSections[index].selectedCategory = value;
    newSections[index].categoryTitle = value?.title || "";
    newSections[index].productTitle = "";
    newSections[index].type = "";
    newSections[index].price = 0;

    newSections[index].selectedProduct = null;

    setSections(newSections);
    updateProducts(index, value?.id, newSections[index].productTitle);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (isCheckVisible) return;
    const requestData = {
      user_id: selectedUser?.id || "",
      daily_price: sections[0]?.dailyPrice.toString() || "0",
      comment: sections[0].comment,
      total_price: sections
        .reduce((acc, section) => acc + section.totalPrice, 0)
        .toString(),
      paid_total: "0",
      products: sections.map((section) => ({
        product_id: section.selectedProduct?.id || "",
        measurement_sold: section.quantity.toString(),
        quantity_sold: section.quantity.toString(),
        price_per_day: section.dailyPrice.toString(),
        unused_days: "0",
        ...(section.startDate.length ? { given_date: section.startDate } : {}),
        ...(section.endDate.length ? { end_date: section.endDate } : {}),
      })),
      service_car: delivery.length ? delivery : [],
    };

    try {
      const response = await axiosInstance.post("/order/create", requestData);
      if (response) {
        showSnackbar("Harid muvaffaqiyatli bajarildi", "success");

        setSelectedUser(null);

        setPhone("");
        setIsCheckVisible(false);
        setSections([
          {
            selectedCategory: null,
            comment: "",
            categoryTitle: "",
            selectedProduct: null,
            productTitle: "",
            quantity: 1,
            rentalDays: 1,
            totalPrice: 0,
            dailyPrice: 0,
            type: "",
            price: 0,
            startDate: "",
            endDate: "",
            unusedDays: 0,
            hasDiscount: false,
            discountPrice: 0,
          },
        ]);
        setDelivery([
          {
            comment: "",
            price: "",
          },
        ]);
        setTitleOrId("");
      }
    } catch (error: any) {
      showSnackbar("Harid qilishda hatto yuzberdi: " + error, "error");
    }
  };

  const handleSelectProduct = (index: number, value: any) => {
    if (!value || !value.id) return;

    const newSections = [...sections];
    newSections[index].selectedProduct = value;
    newSections[index].dailyPrice = value.price * sections[index].quantity;
    newSections[index].totalPrice = value.price * sections[index].quantity;
    newSections[index].price = value.price;
    newSections[index].type = value.type;
    newSections[index].discountPrice = value.price;

    if (value.category_id) {
      const categoryFromList = categories.find(
        (cat) => cat.id === value.category_id.id
      );

      newSections[index].selectedCategory = categoryFromList || {
        id: value.category_id.id,
        title: value.category_id.title,
      };
      newSections[index].categoryTitle = value.category_id.title || "";
    } else {
      newSections[index].selectedCategory = null;
      newSections[index].categoryTitle = "";
    }

    setSections(newSections);
    setTitleOrId(value.title);
  };

  const handleQuantityChange = (index: number, value: number) => {
    const newSections = [...sections];
    newSections[index].quantity = value;
    updateTotalPrice(index, newSections[index]);
    updateDailyPrice(index, newSections[index]);
    setSections(newSections);
  };

  const handleCommentChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].comment = value;
    setSections(newSections);
  };

  const updateTotalPrice = (index: number, section: any) => {
    if (section.selectedProduct) {
      const totalPrice = +section.price * section.quantity * section.rentalDays;
      const newSections = [...sections];
      newSections[index].totalPrice = totalPrice;
      setSections(newSections);
    }
  };
  const updateDailyPrice = (index: number, section: any) => {
    if (section.selectedProduct) {
      const dailyPrice = +section.selectedProduct.price * section.quantity;
      const newSections = [...sections];
      newSections[index].dailyPrice = dailyPrice;
      setSections(newSections);
    }
  };
  const handleStartDateChange = (index: number, date: string) => {
    const newSections = [...sections];
    newSections[index].startDate = date;

    if (newSections[index].endDate) {
      const startDate = new Date(date);
      const endDate = new Date(newSections[index].endDate);
      const rentalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );

      newSections[index].rentalDays = rentalDays;
    } else {
      newSections[index].rentalDays = 1;
    }
    updateTotalPrice(index, newSections[index]);
    setSections(newSections);
  };

  const handleEndDateChange = (index: number, date: string) => {
    const newSections = [...sections];
    newSections[index].endDate = date;
    if (newSections[index].startDate) {
      const startDate = new Date(newSections[index].startDate);
      const endDate = new Date(date);
      const rentalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
      );

      newSections[index].rentalDays = rentalDays;
    }

    updateTotalPrice(index, newSections[index]);
    setSections(newSections);
  };

  const changeDelivery = (
    index: number,
    key: keyof DeliveryDetails,
    value: string
  ) => {
    setDelivery((prevDelivery) =>
      prevDelivery.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      )
    );
  };
  const setUser = async (id: string) => {
    await dispatch(fetchUsers({ pageNumber: 1, pageSize: 1, search: id }));

    const updatedUsers = store.getState().users.users;
    const user = updatedUsers.find((user) => user.id === id);

    if (user) {
      setPhone(user.phone || "");
      setSelectedUser(user);
    } else {
      await dispatch(fetchUsers({ pageNumber: 1, pageSize: 200, search: "" }));

      const allUsers = store.getState().users.users;
      const foundUser = allUsers.find((user) => user.id === id);

      if (foundUser) {
        setPhone(foundUser.phone || "");
        setSelectedUser(foundUser);
      }
    }
  };

  const handleDiscountChange = (index: number, checked: boolean) => {
    const newSections = [...sections];
    newSections[index].hasDiscount = checked;

    if (!checked) {
      newSections[index].discountPrice = 0;
      updateTotalPrice(index, newSections[index]);
    }

    setSections(newSections);
  };

  const handleDiscountPriceChange = (index: number, value: number) => {
    if (value < 0) return;

    const newSections = [...sections];
    newSections[index].discountPrice = value;

    if (newSections[index].selectedProduct) {
      const totalPrice =
        value * newSections[index].quantity * newSections[index].rentalDays;
      newSections[index].totalPrice = totalPrice;

      newSections[index].dailyPrice = value * newSections[index].quantity;
    }

    setSections(newSections);
  };

  // New function to handle adding a product from modal
  const handleAddProduct = (product: any) => {
    setSections((prev) => [...prev, product]);
  };

  // Function to remove a product from table
  const handleRemoveProduct = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };

  // New function to handle adding a car service from modal
  const handleAddCarService = (carService: any) => {
    // Find the user details if there's a user_id
    if (carService.user_id) {
      const user = users.find((user) => user.id === carService.user_id);
      if (user) {
        carService.user_name = `${user.name || ""} ${
          user.last_name || ""
        }`.trim();
      }
    }

    setDelivery((prev) => [...prev, carService]);
  };

  // Function to remove a car service from table
  const handleRemoveCarService = (index: number) => {
    setDelivery((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit} className={styles.wrapper}>
      <div className={styles.row}>
        <Title>Harid qilish</Title>
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
      <div className={styles.content}>
        <div className={styles.rowDiv}>
          {/* User section */}
          <div className={styles.userSection}>
            <h2 className={styles.sectionTitle}>
              <FaUser size={19} /> Foydalanuvchi tanlash
            </h2>
            <input
              type="text"
              style={{ display: "none" }}
              autoComplete="username"
            />

            <div className={styles.userSelectionContainer}>
              {!selectedUser ? (
                <div className={styles.noUserSelected}>
                  <p>Foydalanuvchi tanlanmagan</p>
                  <UserModalForm getIdUser={setUser} />
                </div>
              ) : (
                <div className={styles.userDetails}>
                  <div className={styles.userInfo}>
                    <h5>Tanlangan foydalanuvchi</h5>
                    <p>
                      <strong>Ism:</strong> {selectedUser.name}
                    </p>
                    <p>
                      <strong>Telefon:</strong> {selectedUser.phone}
                    </p>
                    {selectedUser.comment && (
                      <p>
                        <strong>Izoh:</strong> {selectedUser.comment}
                      </p>
                    )}
                  </div>
                  <div className={styles.userActions}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setSelectedUser(null)}
                      size="small"
                      fullWidth
                    >
                      O'zgartirish
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Car services section - now placed next to user section */}
          <div className={styles.carServicesSection}>
            <h2 className={styles.sectionTitle}>
              <FaCar size={19} /> Mashinalar
            </h2>

            <CarServiceModalForm addCarService={handleAddCarService} />

            <CarServicesTable
              carServices={delivery}
              onRemove={handleRemoveCarService}
            />
          </div>
        </div>

        {/* Products section - remains full width */}
        <div className={styles.productsSection}>
          <h2 className={styles.sectionTitle}>
            <FaBox size={19} /> Mahsulotlar
          </h2>

          <ProductModalForm addProduct={handleAddProduct} />

          <ProductsTable products={sections} onRemove={handleRemoveProduct} />
        </div>

        {/* Keep the remaining buttons and check preview */}
        <div className={styles.buttonGroup}>
          <Button
            variant="contained"
            color="warning"
            onClick={() => {
              handlePrint();
            }}
            className={styles.btnWithIcon}
            type="button"
            style={{ marginLeft: "auto", marginTop: 40 }}
          >
            <FaPaperPlane size={22} />
            <span>Chek (PDF)</span>
          </Button>

          <Button
            variant="contained"
            color="secondary"
            type="submit"
            className={styles.btnWithIcon}
            style={{ marginLeft: 20, marginTop: 40 }}
          >
            <FaCartPlus size={22} />
            <span>Sotish</span>
          </Button>
        </div>

        {isCheckVisible && (
          <div ref={chackRef} className={styles.checkPreview}>
            <UserDataSummary
              data={{
                user_id: selectedUser?.id || "",
                user_fullName:
                  `${selectedUser?.name} ${selectedUser?.last_name} ` || "",
                user_phone: selectedUser?.phone || "",
                user_comment: selectedUser?.comment || "",
                daily_price: sections[0]?.dailyPrice.toString() || "0",
                total_price: sections
                  .reduce((acc, section) => acc + section.totalPrice, 0)
                  .toString(),
                paid_total: "0",
                products: sections.map((section: any) => ({
                  product_id:
                    section.selectedProduct?.searchable_title_id || "",
                  product_name: section.selectedProduct?.title || "",
                  quantity_sold:
                    section.quantity.toString() +
                    `${section.type == "dona" ? " dona" : " metr"}`,
                  price_per_day: section.dailyPrice.toString() + " so'm",
                  unused_days: "0",
                  ...(section.hasDiscount
                    ? { original_price: section.price + " so'm" }
                    : {}),
                  ...(section.hasDiscount
                    ? { discount_price: section.discountPrice + " so'm" }
                    : {}),
                  ...(section.startDate.length
                    ? { given_date: section.startDate }
                    : {}),
                  ...(section.endDate.length
                    ? { end_date: section.endDate }
                    : {}),
                })),
                service_car: delivery.length ? delivery : [],
              }}
            />
          </div>
        )}
      </div>
    </form>
  );
};

export default Page;
