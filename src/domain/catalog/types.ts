export type OrderMode = "delivery" | "pickup" | "dine-in";

export type ModifierOption = {
  id: string;
  name: string;
  priceDelta: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  options: ModifierOption[];
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  originalPrice?: number;
  tag?: "熱門" | "新品" | "限定";
  spicy?: boolean;
  featured?: boolean;
  image: string;
  illustration: "chicken" | "spicy" | "nuggets" | "meal" | "fries" | "drink" | "rice" | "dessert";
  modifiers: ModifierGroup[];
  available: boolean;
};

export type Category = {
  id: string;
  name: string;
  description: string;
};

export type Branch = {
  id: string;
  brandId: string;
  name: string;
  address: string;
  phone: string;
  eta: string;
  isOpen: boolean;
  deliveryFee: number;
  packagingFee: number;
};
