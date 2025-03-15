import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
} from "@mui/material";
import { FaTrash } from "react-icons/fa";
import styles from "./ProductsTable.module.scss";

interface ProductsTableProps {
  products: any[];
  onRemove: (index: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  onRemove,
}) => {
  if (products.length === 0) {
    return (
      <div className={styles.noProducts}>
        <Typography variant="body1">Mahsulotlar qo'shilmagan</Typography>
      </div>
    );
  }

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Nomi</TableCell>
            <TableCell>Kategoriya</TableCell>
            <TableCell>Miqdor</TableCell>
            <TableCell>Kunlar</TableCell>
            <TableCell>Kunlik narx</TableCell>
            <TableCell>Jami narx</TableCell>
            <TableCell>Amal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {product.selectedProduct?.title || ""}
                <div className={styles.productId}>
                  ID: {product.selectedProduct?.searchable_title_id || ""}
                </div>
              </TableCell>
              <TableCell>{product.categoryTitle}</TableCell>
              <TableCell>
                {product.quantity} {product.type === "dona" ? "dona" : "metr"}
              </TableCell>
              <TableCell>{product.rentalDays} kun</TableCell>
              <TableCell>
                {product.hasDiscount ? (
                  <>
                    <span className={styles.strikethrough}>
                      {product.price}
                    </span>
                    <span className={styles.discount}>
                      {product.discountPrice}
                    </span>
                  </>
                ) : (
                  product.price
                )}{" "}
                so'm
              </TableCell>
              <TableCell>{product.totalPrice.toLocaleString()} so'm</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onRemove(index)}
                >
                  <FaTrash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className={styles.tableFooter}>
        <Typography variant="subtitle1">
          <strong>Jami:</strong>{" "}
          {products
            .reduce((sum, product) => sum + product.totalPrice, 0)
            .toLocaleString()}{" "}
          so'm
        </Typography>
      </div>
    </TableContainer>
  );
};

export default ProductsTable;
