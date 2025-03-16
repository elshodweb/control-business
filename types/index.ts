export type RentalDetails = {
  selectedCategory: any;
  categoryTitle: string;
  selectedProduct: any;
  productTitle: string;
  quantity: number;
  rentalDays: number;
  totalPrice: number;
  dailyPrice: number;
  type: string;
  price: number;
  startDate: string;
  endDate: string;
  status?: string;
  action?: ActionTypesEnum;
  unusedDays: number;
  comment: string;
};

export type DeliveryDetails = {
  price: string;
  comment: string;
  service_car_id?: string;
  action?: ActionTypesEnum;
};

export type DebtDetails = {
  remaining_debt: string;
  comment: string;
  isActive: "true";
  dayToBeGiven: "2023-01-01T00:00:00Z";
  dayGiven?: string;
};

export enum ActionTypesEnum {
  GET = "get",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
}

export enum IsActiveType {
  ACTIVE = "active",
  INACTIVE = "inactive",
}
