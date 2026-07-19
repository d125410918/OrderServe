export type ParticipantSubtotal = {
  participantId: string;
  subtotal: number;
};

export function allocateProportionally(totalAmount: number, participants: ParticipantSubtotal[]): Record<string, number> {
  if (!Number.isInteger(totalAmount) || totalAmount < 0) {
    throw new Error("分攤金額必須是非負整數");
  }
  if (participants.length === 0) return {};
  participants.forEach(({ subtotal }) => {
    if (!Number.isInteger(subtotal) || subtotal < 0) {
      throw new Error("個人小計必須是非負整數");
    }
  });

  const ordered = [...participants].sort((a, b) => a.participantId.localeCompare(b.participantId));
  const subtotalSum = ordered.reduce((sum, participant) => sum + participant.subtotal, 0);
  const basis = subtotalSum === 0 ? ordered.map(() => 1) : ordered.map((participant) => participant.subtotal);
  const basisSum = basis.reduce((sum, value) => sum + value, 0);

  const rows = ordered.map((participant, index) => {
    const numerator = totalAmount * basis[index];
    return {
      participantId: participant.participantId,
      allocated: Math.floor(numerator / basisSum),
      remainder: numerator % basisSum,
    };
  });

  let remaining = totalAmount - rows.reduce((sum, row) => sum + row.allocated, 0);
  const byRemainder = [...rows].sort((a, b) => b.remainder - a.remainder || a.participantId.localeCompare(b.participantId));
  for (let index = 0; index < byRemainder.length && remaining > 0; index += 1, remaining -= 1) {
    byRemainder[index].allocated += 1;
  }

  return Object.fromEntries(rows.map((row) => [row.participantId, row.allocated]));
}
