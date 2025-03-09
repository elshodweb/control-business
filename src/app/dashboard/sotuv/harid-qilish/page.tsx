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

  // Update the handleSubmit function to use discounted prices
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
    newSections[index].discountPrice = value.price; // Initialize discount price to regular price

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
    await dispatch(fetchUsers({ pageNumber: 1, pageSize: 200, search: phone }));

    const updatedUsers = store.getState().users.users;
    const user = updatedUsers.find((user) => user.id === id);

    if (user) {
      setPhone(user.phone);
      setSelectedUser(user);
    }
  };

  // Add these functions to handle discount changes
  const handleDiscountChange = (index: number, checked: boolean) => {
    const newSections = [...sections];
    newSections[index].hasDiscount = checked;

    if (!checked) {
      // Reset discount price and recalculate total price based on original price
      newSections[index].discountPrice = 0;
      updateTotalPrice(index, newSections[index]);
    }

    setSections(newSections);
  };

  const handleDiscountPriceChange = (index: number, value: number) => {
    if (value < 0) return;

    const newSections = [...sections];
    newSections[index].discountPrice = value;

    // Update total price based on discounted price
    if (newSections[index].selectedProduct) {
      const totalPrice =
        value * newSections[index].quantity * newSections[index].rentalDays;
      newSections[index].totalPrice = totalPrice;

      // Also update daily price
      newSections[index].dailyPrice = value * newSections[index].quantity;
    }

    setSections(newSections);
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
          <div className={styles.userSection}>
            <h2 className={styles.sectionTitle}>
              <FaUser size={19} /> Foydalanuvchi tanlash
            </h2>
            <input
              type="text"
              style={{ display: "none" }}
              autoComplete="username"
            />

            <Autocomplete
              className={styles.autocomplete}
              id="user-selection-autocomplete"
              size="small"
              options={users}
              onChange={(event, value) => setSelectedUser(value)}
              getOptionLabel={(option: any) =>
                `${option.name || "Без имени"} (${
                  option.phone || "Нет телефона"
                })`
              }
              value={selectedUser}
              isOptionEqualToValue={(option, value) =>
                option.phone === value.phone
              }
              autoComplete={false}
              renderInput={(params) => (
                <TextField
                  required
                  {...params}
                  size="small"
                  label="Telefon nomer"
                  variant="outlined"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}
            />
            {selectedUser && (
              <div className={styles.userDetails}>
                <h5>Tanlangan foydalanuvchi</h5>
                <p>Ism: {selectedUser.name}</p>
                <p>Telefon: {selectedUser.phone}</p>
              </div>
            )}
            <UserModalForm getIdUser={setUser}></UserModalForm>
          </div>

          {sections.map((section, index) => (
            <div key={index} className={styles.product}>
              <h2 className={styles.sectionTitle}>
                <FaBox size={19} /> {index + 1}-Mahsulot
              </h2>

              {/* Category and Product Selection Row */}
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h4 className={styles.itemTitle}>Mahsulot kategoriyasini</h4>
                  <Autocomplete
                    className={styles.autocomplete}
                    size="small"
                    options={categories}
                    onChange={(event, value) =>
                      handleChangeCategory(index, value)
                    }
                    value={section.selectedCategory}
                    getOptionLabel={(option) => option.title || "Без названия"}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        value={section.categoryTitle}
                        label="Kategoriya"
                        variant="outlined"
                      />
                    )}
                  />
                </div>
                <div className={styles.formColumn}>
                  <h4 className={styles.itemTitle}>Mahsulotni tanlash</h4>
                  <Autocomplete
                    className={styles.autocomplete}
                    size="small"
                    options={autocompleteProducts}
                    onChange={(event, value) =>
                      handleSelectProduct(index, value)
                    }
                    getOptionLabel={(option: any) =>
                      option.title + " (" + option.searchable_title_id + ")" ||
                      "Без названия"
                    }
                    clearIcon={false}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    renderInput={(params) => (
                      <TextField
                        required
                        {...params}
                        size="small"
                        value={titleOrId}
                        label="Product"
                        variant="outlined"
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          setTitleOrId(inputValue);
                          const isNumeric = /^\d+$/.test(inputValue);

                          updateProducts(
                            index,
                            sections[index].selectedCategory?.id || null,
                            isNumeric ? "" : inputValue,
                            isNumeric ? inputValue : null
                          );
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              {section.selectedProduct && (
                <>
                  {/* Price and Quantity Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>
                        {section.type + " Narxi"}
                      </h4>
                      <TextField
                        required
                        size="small"
                        type="number"
                        minRows={0}
                        variant="outlined"
                        value={section.price}
                        disabled
                        fullWidth
                      />
                    </div>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Arenda olish miqdori</h4>
                      <TextField
                        required
                        size="small"
                        type="number"
                        variant="outlined"
                        value={section.quantity}
                        onChange={(e) => {
                          if (+e.target.value > 0) {
                            handleQuantityChange(index, +e.target.value);
                          }
                        }}
                        fullWidth
                      />
                    </div>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Arenda kunlik narxi</h4>
                      <TextField
                        required
                        size="small"
                        type="number"
                        variant="outlined"
                        value={sections[index].dailyPrice}
                        disabled
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* Date Selection Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Arenda boshlanishi</h4>
                      <TextField
                        required
                        size="small"
                        type="date"
                        className={styles.dateInput}
                        variant="outlined"
                        value={section.startDate}
                        onChange={(e) =>
                          handleStartDateChange(index, e.target.value)
                        }
                        fullWidth
                      />
                    </div>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Arenda tugashi</h4>
                      <TextField
                        required
                        size="small"
                        type="date"
                        className={styles.dateInput}
                        variant="outlined"
                        value={section.endDate}
                        onChange={(e) =>
                          handleEndDateChange(index, e.target.value)
                        }
                        fullWidth
                      />
                    </div>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Arenda Umumiy narxi</h4>
                      <TextField
                        required
                        size="small"
                        type="number"
                        variant="outlined"
                        value={sections[index].totalPrice}
                        disabled
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* Discount Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formColumn}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={section.hasDiscount}
                            onChange={(e) =>
                              handleDiscountChange(index, e.target.checked)
                            }
                          />
                        }
                        label="Chegirma qo'shish"
                      />
                    </div>
                  </div>

                  {section.hasDiscount && (
                    <div className={styles.formRow}>
                      <div className={styles.formColumn}>
                        <h4 className={styles.itemTitle}>Chegirma narxi</h4>
                        <TextField
                          required
                          size="small"
                          type="number"
                          variant="outlined"
                          value={section.discountPrice}
                          onChange={(e) => {
                            if (+e.target.value >= 0) {
                              handleDiscountPriceChange(index, +e.target.value);
                            }
                          }}
                          fullWidth
                        />
                      </div>
                      <div className={styles.formColumn}>
                        <h4 className={styles.itemTitle}>
                          Chegirma bilan narx
                        </h4>
                        <TextField
                          size="small"
                          type="number"
                          variant="outlined"
                          value={section.totalPrice}
                          disabled
                          fullWidth
                        />
                      </div>
                    </div>
                  )}

                  {/* Unused Days and Comment Row */}
                  <div className={styles.formRow}>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Ishlatilmagan kunlar</h4>
                      <TextField
                        required
                        size="small"
                        type="number"
                        variant="outlined"
                        value={sections[index].unusedDays}
                        onChange={(e) => {
                          if (+e.target.value > -1) {
                            updateUnusedDays(index, section, +e.target.value);
                          }
                        }}
                        fullWidth
                      />
                    </div>
                    <div className={styles.formColumn}>
                      <h4 className={styles.itemTitle}>Izoh</h4>
                      <TextField
                        required
                        size="small"
                        type="text"
                        variant="outlined"
                        value={sections[index].comment}
                        onChange={(e) =>
                          handleCommentChange(index, e.target.value)
                        }
                        fullWidth
                      />
                    </div>
                  </div>
                </>
              )}

              <div className={styles.actionBtnContainer}>
                {index !== 0 && (
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveSection(index)}
                    className={styles.deleteButton}
                  >
                    <FaTrash size={19} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button
          className={styles.btnWithIcon}
          style={{ marginLeft: "auto" }}
          variant="contained"
          color="primary"
          onClick={handleAddSection}
        >
          <FaPlus size={22} />
          <span>Mahsulot</span>
        </Button>
        <div className={styles.cars}>
          {delivery.map((el, i) => (
            <div key={i} className={styles.car}>
              <h2 className={styles.sectionTitle}>
                <FaCar size={19} /> {i + 1}-Mashina
              </h2>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h4 className={styles.itemTitle}>Mashina narxi</h4>
                  <TextField
                    required
                    size="small"
                    variant="outlined"
                    label="Narhi"
                    value={el.price}
                    onChange={(e) => changeDelivery(i, "price", e.target.value)}
                    fullWidth
                  />
                </div>

                <div className={styles.formColumn}>
                  <h4 className={styles.itemTitle}>Izoh</h4>
                  <TextField
                    required
                    size="small"
                    variant="outlined"
                    label="Kommentariya"
                    value={el.comment}
                    onChange={(e) =>
                      changeDelivery(i, "comment", e.target.value)
                    }
                    fullWidth
                  />
                </div>
              </div>
              <div className={styles.actionBtnContainer}>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={() => handleRemoveDelivery(i)}
                  className={styles.deleteButton}
                >
                  <FaTrash size={19} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          className={styles.btnWithIcon}
          style={{ marginLeft: "auto" }}
          variant="contained"
          color="primary"
          onClick={handleAddDelivery}
        >
          <FaPlus size={22} />
          <span>Mashina</span>
        </Button>
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
