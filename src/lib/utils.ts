import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines multiple class names into a single string, resolving
 * Tailwind CSS conflicts using twMerge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
