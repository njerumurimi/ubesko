import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const constructUrlWithParams = (
  pathname: string,
  params: URLSearchParams
): string => {
  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export const slugify = (str: string): string =>
  str
    .trim() // Trim leading/trailing whitespace
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, "") // Remove non-alphanumeric characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one

export const setCSSVariable = (name: string, value: string): void => {
  if (typeof window !== "undefined") {
    document.documentElement?.style.setProperty(name, value)
  }
}

export const formatAmountForDisplay = (
  amount: number,
  currency: string,
  removeCents: boolean = false
): string => {
  if (isNaN(amount)) return ""
  let numberFormat = new Intl.NumberFormat(["en-US"], {
    style: "currency",
    currency: currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: removeCents ? 0 : 2,
    maximumFractionDigits: removeCents ? 0 : 2,
  })
  return numberFormat.format(amount)
}