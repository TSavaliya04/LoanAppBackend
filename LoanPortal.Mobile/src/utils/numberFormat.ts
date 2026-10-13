export const formatNumberWithCommas = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
  return isNaN(num) ? "" : num.toLocaleString("en-US");
};

export const parseFormattedNumber = (value: string): number | null => {
  const numeric = Number(value.replace(/,/g, ""));
  return isNaN(numeric) ? null : numeric;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  // Get month, day, and year
  const month = date.getMonth() + 1; // Months are 0-based
  const day = date.getDate();
  const year = date.getFullYear() % 100; // Last two digits

  return `${month}/${day}/${year}`;
};

export function formatAmount(amount: number) {
  if (isNaN(amount)) return "0.00";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDecimal(value: number) {
  if (typeof value !== "number") return value;

  const decimalPart = value.toString().split(".")[1] || "";

  if (decimalPart.length > 2) {
    return parseFloat(value.toFixed(2));
  }

  return value;
}

export function formatUSPhoneNumber(input: string) {
  const digits = input.replace(/\D/g, "");
  const last10 = digits.slice(-10);
  if (last10.length !== 10) {
    return "Invalid number"; // Not enough digits
  }
  return `(${last10.slice(0, 3)}) ${last10.slice(3, 6)}-${last10.slice(6)}`;
}

export const toBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};