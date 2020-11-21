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

export const dateTimeFormatter = new Intl.DateTimeFormat(locales, {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatCurrency(value) {
  return currencyFormatter.format(value);
}

export function formatDecimal(value, decimals = 2) {
  return value.toFixed(decimals);
}

export function formatAddress(value) {
  return value;
}
