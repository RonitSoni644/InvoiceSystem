// Utility functions for the invoice system

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const validateGSTIN = (gstin: string): boolean => {
  const gstinRegex =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(gstin);
};

export const calculateGST = (
  subtotal: number,
  gstRate: number,
  isSameState: boolean = true,
): { cgst: number; sgst: number; igst: number } => {
  const gstAmount = (subtotal * gstRate) / 100;

  if (isSameState) {
    return {
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
    };
  } else {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
    };
  }
};

export const convertNumberToWords = (amount: number): string => {
  if (amount === 0) return "Zero";

  const numbers: { [key: number]: string } = {
    0: "Zero",
    1: "One",
    2: "Two",
    3: "Three",
    4: "Four",
    5: "Five",
    6: "Six",
    7: "Seven",
    8: "Eight",
    9: "Nine",
    10: "Ten",
    11: "Eleven",
    12: "Twelve",
    13: "Thirteen",
    14: "Fourteen",
    15: "Fifteen",
    16: "Sixteen",
    17: "Seventeen",
    18: "Eighteen",
    19: "Nineteen",
    20: "Twenty",
    30: "Thirty",
    40: "Forty",
    50: "Fifty",
    60: "Sixty",
    70: "Seventy",
    80: "Eighty",
    90: "Ninety",
  };

  const convert = (n: number): string => {
    if (n <= 20) return numbers[n];
    if (n < 100)
      return (
        numbers[Math.floor(n / 10) * 10] + (n % 10 ? " " + numbers[n % 10] : "")
      );
    if (n < 1000)
      return (
        convert(Math.floor(n / 100)) +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  };

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let words = convert(rupees) + " Rupees";
  if (paise > 0) words += " and " + convert(paise) + " Paise";

  return words;
};
