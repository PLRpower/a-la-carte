import { Stock, StockWithIngredient } from "@/types/database";

export type ExpirationUrgency = "expired" | "critical" | "warning" | "good" | "none";

export interface ExpirationStatus {
  urgency: ExpirationUrgency;
  diffHours: number;
  diffDays: number;
  isUrgent: boolean; // true if expired or expiring within 48h
  label: string;
  badgeText: string;
  formattedDate: string;
}

/**
 * Calculates expiration urgency relative to a reference date (defaults to now)
 */
export function getExpirationStatus(
  expirationDate: string | null | undefined,
  now: Date = new Date()
): ExpirationStatus {
  if (!expirationDate) {
    return {
      urgency: "none",
      diffHours: Infinity,
      diffDays: Infinity,
      isUrgent: false,
      label: "Pas de date",
      badgeText: "",
      formattedDate: "",
    };
  }

  // Parse expiration date (handling YYYY-MM-DD or ISO strings)
  const expDate = new Date(expirationDate);
  // Set expiration end-of-day if only date without time was provided
  if (expirationDate.length === 10) {
    expDate.setHours(23, 59, 59, 999);
  }

  const diffMs = expDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = expDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  if (diffMs < 0) {
    const daysAgo = Math.abs(diffDays);
    return {
      urgency: "expired",
      diffHours,
      diffDays,
      isUrgent: true,
      label: daysAgo <= 0 ? "Périmé aujourd'hui" : `Périmé (${daysAgo}j)`,
      badgeText: "Périmé",
      formattedDate,
    };
  }

  if (diffHours <= 48) {
    let label = "Expire dans 48h";
    if (diffHours <= 12) {
      label = "Expire aujourd'hui !";
    } else if (diffHours <= 24) {
      label = "Expire demain !";
    } else {
      label = `Expire sous ${diffHours}h`;
    }

    return {
      urgency: "critical",
      diffHours,
      diffDays,
      isUrgent: true,
      label,
      badgeText: diffHours <= 24 ? "DLC : Demain" : "DLC < 48h",
      formattedDate,
    };
  }

  if (diffDays <= 7) {
    return {
      urgency: "warning",
      diffHours,
      diffDays,
      isUrgent: false,
      label: `Expire dans ${diffDays}j`,
      badgeText: `DLC : ${diffDays}j`,
      formattedDate,
    };
  }

  return {
    urgency: "good",
    diffHours,
    diffDays,
    isUrgent: false,
    label: `DLC : ${formattedDate}`,
    badgeText: formattedDate,
    formattedDate,
  };
}

/**
 * Filters stock items that are expiring within the specified hours (defaults to 48h) or already expired.
 * Results are sorted with most urgent first.
 */
export function getExpiringStockItems<T extends Stock | StockWithIngredient>(
  items: T[],
  maxHours: number = 48,
  now: Date = new Date()
): Array<T & { expirationStatus: ExpirationStatus }> {
  return items
    .filter((item) => !!item.expiration_date)
    .map((item) => ({
      ...item,
      expirationStatus: getExpirationStatus(item.expiration_date, now),
    }))
    .filter((item) => item.expirationStatus.diffHours <= maxHours)
    .sort((a, b) => a.expirationStatus.diffHours - b.expirationStatus.diffHours);
}
