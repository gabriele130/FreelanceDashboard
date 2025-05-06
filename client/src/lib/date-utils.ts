import { format, formatDistance, isToday, isTomorrow, isYesterday } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Formats a date string or Date object into a human-readable format
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return format(dateObj, "d MMMM yyyy", { locale: it });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

/**
 * Formats a date for display in task deadlines with relative dates
 */
export const formatDeadline = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    if (isToday(dateObj)) {
      return "Oggi";
    }
    
    if (isTomorrow(dateObj)) {
      return "Domani";
    }
    
    if (isYesterday(dateObj)) {
      return "Ieri";
    }
    
    return format(dateObj, "d MMMM", { locale: it });
  } catch (error) {
    console.error("Error formatting deadline:", error);
    return "";
  }
};

/**
 * Formats a date with time
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return format(dateObj, "d MMMM yyyy, HH:mm", { locale: it });
  } catch (error) {
    console.error("Error formatting date time:", error);
    return "";
  }
};

/**
 * Returns a relative time string (e.g. "2 giorni fa")
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    return formatDistance(dateObj, new Date(), { 
      addSuffix: true,
      locale: it 
    });
  } catch (error) {
    console.error("Error formatting relative time:", error);
    return "";
  }
};

/**
 * Formats a date for display in payments with "Scade: " prefix for pending payments
 */
export const formatPaymentDate = (date: string | Date | null | undefined, status: 'received' | 'pending'): string => {
  if (!date) return "";
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return "";
    }
    
    if (status === 'pending') {
      return `Scade: ${format(dateObj, "d MMMM yyyy", { locale: it })}`;
    } else {
      return format(dateObj, "d MMMM yyyy", { locale: it });
    }
  } catch (error) {
    console.error("Error formatting payment date:", error);
    return "";
  }
};

/**
 * Check if a date is past (before today)
 */
export const isPastDate = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  } catch (error) {
    return false;
  }
};

/**
 * Gets the current date in Italian format
 */
export const getCurrentDateItalian = (): string => {
  return format(new Date(), "d MMMM yyyy", { locale: it });
};
