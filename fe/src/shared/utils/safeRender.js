// fe\src\shared\utils\safeRender.js
export const safeText = (value) => {
 if (value === null || value === undefined) return "-";

 if (typeof value === "object") {
  if (value?.category_name) return value.category_name;
  if (value?.location_name) return value.location_name;
  if (value?.name) return value.name;

  return JSON.stringify(value);
 }

 return String(value);
};

export const safeNumber = (value) => {
 const n = Number(value);
 return isNaN(n) ? 0 : n;
};

export const safeCurrency = (value) => {
 return new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
 }).format(safeNumber(value));
};