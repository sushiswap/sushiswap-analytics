const locales = ["en-US"];

export const currencyFormatter = new Intl.NumberFormat(locales, {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  // minimumFractionDigits: 0,
  // maximumFractionDigits: 0,
});

export const decimalFormatter = new Intl.NumberFormat(locales, {
  style: "decimal",
});

export const dateTimeFormatter = new Intl.DateTimeFormat(locales, {
  year: "numeric",
  month: "long",
  day: "numeric",
});
