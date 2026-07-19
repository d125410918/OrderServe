export type CartState = "EMPTY" | "EDITING" | "VALIDATING" | "VALID" | "INVALID" | "CHECKOUT_SUBMITTING" | "CONVERTED" | "ABANDONED";
export type CartEvent = "ADD_ITEM" | "EDIT" | "VALIDATE" | "VALIDATION_SUCCEEDED" | "VALIDATION_FAILED" | "SUBMIT" | "CONVERT" | "ABANDON" | "RESET";

const transitions: Record<CartState, Partial<Record<CartEvent, CartState>>> = {
  EMPTY: { ADD_ITEM: "EDITING", RESET: "EMPTY" },
  EDITING: { EDIT: "EDITING", VALIDATE: "VALIDATING", ABANDON: "ABANDONED", RESET: "EMPTY" },
  VALIDATING: { VALIDATION_SUCCEEDED: "VALID", VALIDATION_FAILED: "INVALID" },
  VALID: { EDIT: "EDITING", SUBMIT: "CHECKOUT_SUBMITTING", RESET: "EMPTY" },
  INVALID: { EDIT: "EDITING", VALIDATE: "VALIDATING", RESET: "EMPTY" },
  CHECKOUT_SUBMITTING: { CONVERT: "CONVERTED", VALIDATION_FAILED: "INVALID" },
  CONVERTED: { RESET: "EMPTY" },
  ABANDONED: { RESET: "EMPTY" },
};

export function transitionCart(state: CartState, event: CartEvent): CartState {
  const next = transitions[state][event];
  if (!next) throw new Error(`非法購物車狀態轉換：${state} -> ${event}`);
  return next;
}
