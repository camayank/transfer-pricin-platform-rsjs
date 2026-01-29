import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function getAssessmentYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  // Financial year starts April 1
  if (month >= 3) {
    return `${year + 1}-${(year + 2).toString().slice(-2)}`;
  }
  return `${year}-${(year + 1).toString().slice(-2)}`;
}
