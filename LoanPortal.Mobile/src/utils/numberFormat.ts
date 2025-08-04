export const formatNumberWithCommas = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  return isNaN(num) ? "" : num.toLocaleString("en-US");
};

export const parseFormattedNumber = (value: string): number | null => {
  const numeric = Number(value.replace(/,/g, ""));
  return isNaN(numeric) ? null : numeric;
};