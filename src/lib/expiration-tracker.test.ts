import { describe, it, expect } from "vitest";
import { getExpirationStatus, getExpiringStockItems } from "./expiration-tracker";

describe("expiration-tracker", () => {
  const fixedNow = new Date("2026-09-17T12:00:00.000Z");

  it("handles null or missing expiration date", () => {
    const status = getExpirationStatus(null, fixedNow);
    expect(status.urgency).toBe("none");
    expect(status.isUrgent).toBe(false);
  });

  it("identifies expired items", () => {
    // Yesterday
    const status = getExpirationStatus("2026-09-16", fixedNow);
    expect(status.urgency).toBe("expired");
    expect(status.isUrgent).toBe(true);
    expect(status.badgeText).toBe("Périmé");
  });

  it("identifies critical items expiring within 48h", () => {
    // Tomorrow (within 36h)
    const status = getExpirationStatus("2026-09-18", fixedNow);
    expect(status.urgency).toBe("critical");
    expect(status.isUrgent).toBe(true);
    expect(status.diffHours).toBeLessThanOrEqual(48);
  });

  it("identifies items expiring in 5 days as warning", () => {
    const status = getExpirationStatus("2026-09-22", fixedNow);
    expect(status.urgency).toBe("warning");
    expect(status.isUrgent).toBe(false);
  });

  it("filters and sorts expiring stock items by urgency", () => {
    const stockItems = [
      {
        id: "1",
        user_id: "u1",
        ingredient_id: "i1",
        quantity: 2,
        unit: "piece" as const,
        expiration_date: "2026-09-25", // In 8 days
        low_stock: false,
        created_at: "",
        updated_at: "",
      },
      {
        id: "2",
        user_id: "u1",
        ingredient_id: "i2",
        quantity: 1,
        unit: "piece" as const,
        expiration_date: "2026-09-18", // Tomorrow (< 48h)
        low_stock: false,
        created_at: "",
        updated_at: "",
      },
      {
        id: "3",
        user_id: "u1",
        ingredient_id: "i3",
        quantity: 1,
        unit: "piece" as const,
        expiration_date: "2026-09-16", // Yesterday (expired)
        low_stock: false,
        created_at: "",
        updated_at: "",
      },
    ];

    const expiring = getExpiringStockItems(stockItems, 48, fixedNow);
    expect(expiring).toHaveLength(2);
    // Most urgent (expired) comes first
    expect(expiring[0].id).toBe("3");
    expect(expiring[1].id).toBe("2");
  });
});
