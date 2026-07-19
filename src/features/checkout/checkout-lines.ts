import type { CartLine, RoomParticipant } from "@/application/order-store/types";

export type CheckoutLine = CartLine & { participantName?: string };

export function buildCheckoutLines(cartItems: CartLine[], participants: RoomParticipant[], fallback: CartLine[]): CheckoutLine[] {
  const submittedRoomLines = participants
    .filter((participant) => participant.status === "submitted")
    .flatMap((participant) => participant.items.map((item) => ({ ...item, lineId: `${participant.id}-${item.lineId}`, participantName: participant.name })));
  if (submittedRoomLines.length > 0) return submittedRoomLines;
  if (cartItems.length > 0) return cartItems;
  return fallback;
}
