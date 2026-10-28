export function formatBrazilPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function onlyLettersAndSpaces(value: string): string {
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, "");
}

export function onlyLetters(value: string): string {
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ]/g, "").slice(0, 2).toUpperCase();
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}
