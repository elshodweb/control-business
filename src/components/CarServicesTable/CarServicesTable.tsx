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
import styles from "./CarServicesTable.module.scss";

interface CarServicesTableProps {
  carServices: any[];
  onRemove: (index: number) => void;
}

const CarServicesTable: React.FC<CarServicesTableProps> = ({
  carServices,
  onRemove,
}) => {
  if (carServices.length === 0) {
    return (
      <div className={styles.noServices}>
        <Typography variant="body1">Mashinalar qo'shilmagan</Typography>
      </div>
    );
  }

  return (
    <TableContainer component={Paper} className={styles.tableContainer}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>№</TableCell>
            <TableCell>Narx</TableCell>
            <TableCell>Izoh</TableCell>
            <TableCell>Amal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {carServices.map((service, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{service.price} so'm</TableCell>
              <TableCell>{service.comment || "-"}</TableCell>
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
          {carServices
            .reduce((sum, service) => sum + Number(service.price), 0)
            .toLocaleString()}{" "}
          so'm
        </Typography>
      </div>
    </TableContainer>
  );
};

export default CarServicesTable;
