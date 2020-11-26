const locales = ["en-US"];

export const currencyFormatter = new Intl.NumberFormat(locales, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export const decimalFormatter = new Intl.NumberFormat(locales, {
  style: "decimal",
  minimumSignificantDigits: 1,
  maximumSignificantDigits: 4,
});

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatDecimal(value) {
  return decimalFormatter.format(value);
}

export function formatAddress(value) {
  return value;
}
