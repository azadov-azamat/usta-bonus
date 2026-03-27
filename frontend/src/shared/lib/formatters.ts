const moneyFormatter = new Intl.NumberFormat("uz-UZ");
const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const dateTimeFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatMoney(amount: number) {
  return `${moneyFormatter.format(amount)} so'm`;
}

export function formatDate(date: string | Date | null) {
  if (!date) {
    return "Yo'q";
  }

  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | Date | null) {
  if (!date) {
    return "Yo'q";
  }

  return dateTimeFormatter.format(new Date(date));
}
