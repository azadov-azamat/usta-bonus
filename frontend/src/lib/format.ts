export function formatMoney(value: number) {
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so'm`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString("uz-UZ");
}
