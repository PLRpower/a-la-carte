import { describe, it, expect } from "vitest";
import { parseExifOrientation, getExifRotationAngle } from "./imageExif";

describe("imageExif utility", () => {
  it("should return 1 for non-jpeg data", () => {
    const nonJpeg = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer; // PNG
    expect(parseExifOrientation(nonJpeg)).toBe(1);
  });

  it("should return 1 for empty or small buffer", () => {
    const empty = new ArrayBuffer(0);
    expect(parseExifOrientation(empty)).toBe(1);
  });

  it("should return 1 for JPEG without EXIF segment", () => {
    // Basic JPEG with only SOI (FF D8) and EOI (FF D9)
    const jpegWithoutExif = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]).buffer;
    expect(parseExifOrientation(jpegWithoutExif)).toBe(1);
  });

  it("should correctly parse EXIF orientation 6 (90° CW)", () => {
    // 2x1 JPEG with EXIF orientation tag 6
    const base64 =
      "/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==";

    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const orientation = parseExifOrientation(bytes.buffer);
    expect(orientation).toBe(6);
  });

  it("should map orientation values to rotation degrees", () => {
    expect(getExifRotationAngle(1)).toBe(0);
    expect(getExifRotationAngle(3)).toBe(180);
    expect(getExifRotationAngle(6)).toBe(90);
    expect(getExifRotationAngle(8)).toBe(270);
    expect(getExifRotationAngle(2)).toBe(0);
  });
});
