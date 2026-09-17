import { describe, it, expect } from "vitest";
import { extractDurations, segmentTextWithDurations, formatSeconds } from "./cooking-timer";

describe("cooking-timer", () => {
  it("formats seconds accurately", () => {
    expect(formatSeconds(0)).toBe("00:00");
    expect(formatSeconds(59)).toBe("00:59");
    expect(formatSeconds(65)).toBe("01:05");
    expect(formatSeconds(1200)).toBe("20:00");
    expect(formatSeconds(3665)).toBe("1:01:05");
  });

  it("extracts simple minutes from text", () => {
    const text = "Laisser mijoter 20 min à feu doux.";
    const durations = extractDurations(text);
    expect(durations.length).toBe(1);
    expect(durations[0].totalSeconds).toBe(1200);
    expect(durations[0].label).toBe("20 min");
  });

  it("extracts hour and minute combinations", () => {
    const text = "Enfourner pendant 1h30 puis laisser reposer 15 minutes.";
    const durations = extractDurations(text);
    expect(durations.length).toBe(2);
    expect(durations[0].totalSeconds).toBe(5400); // 90 min
    expect(durations[1].totalSeconds).toBe(900); // 15 min
  });

  it("extracts minute ranges with upper bound", () => {
    const text = "Faites dorer les oignons 10 à 15 min en remuant.";
    const durations = extractDurations(text);
    expect(durations.length).toBe(1);
    expect(durations[0].totalSeconds).toBe(900); // 15 min
    expect(durations[0].label).toBe("10 à 15 min");
  });

  it("extracts seconds", () => {
    const text = "Faites saisir la viande 45 sec sur chaque face.";
    const durations = extractDurations(text);
    expect(durations.length).toBe(1);
    expect(durations[0].totalSeconds).toBe(45);
  });

  it("segments text cleanly for interactive UI rendering", () => {
    const text = "Faire cuire 10 min puis servir chaud.";
    const segments = segmentTextWithDurations(text);
    expect(segments.length).toBe(3);
    expect(segments[0]).toEqual({ type: "text", content: "Faire cuire " });
    expect(segments[1]).toEqual({
      type: "duration",
      content: "10 min",
      seconds: 600,
      label: "10 min",
    });
    expect(segments[2]).toEqual({ type: "text", content: " puis servir chaud." });
  });

  it("handles text with no durations gracefully", () => {
    const text = "Mélanger la farine et le sel dans un grand saladier.";
    const segments = segmentTextWithDurations(text);
    expect(segments.length).toBe(1);
    expect(segments[0]).toEqual({ type: "text", content: text });
  });
});
