export type PricedItem = {
  id: string;
  unitPrice: number;
  quantity: number;
};

export type CartFees = {
  deliveryFee?: number;
  packagingFee?: number;
  serviceFee?: number;
  discount?: number;
};

export type CartTotals = Required<CartFees> & {
  subtotal: number;
  total: number;
};

function assertMoney(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error("金額必須是非負整數");
  }
}

export function calculateCartTotals(items: PricedItem[], fees: CartFees = {}): CartTotals {
  const subtotal = items.reduce((sum, item) => {
    assertMoney(item.unitPrice);
    if (!Number.isInteger(item.quantity) || item.quantity < 0) {
      throw new Error("數量必須是非負整數");
    }
    return sum + item.unitPrice * item.quantity;
  }, 0);

  const deliveryFee = fees.deliveryFee ?? 0;
  const packagingFee = fees.packagingFee ?? 0;
  const serviceFee = fees.serviceFee ?? 0;
  const discount = fees.discount ?? 0;
  [deliveryFee, packagingFee, serviceFee, discount].forEach(assertMoney);

  return {
    subtotal,
    deliveryFee,
    packagingFee,
    serviceFee,
    discount,
    total: Math.max(0, subtotal + deliveryFee + packagingFee + serviceFee - discount),
  };
}
