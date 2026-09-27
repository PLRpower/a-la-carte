import { useState, useEffect } from "react";

/**
 * Robust lightweight parser to extract EXIF Orientation tag (0x0112) from a JPEG ArrayBuffer.
 * Returns orientation integer from 1 to 8 (1 = normal / default).
 */
export function parseExifOrientation(buffer: ArrayBuffer): number {
  if (!buffer || buffer.byteLength < 4) return 1;
  const view = new DataView(buffer);

  // JPEG SOI (Start of Image) marker: 0xFFD8
  if (view.getUint16(0, false) !== 0xffd8) return 1;

  let offset = 2;
  const length = view.byteLength;

  while (offset + 4 <= length) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1) {
      // APP1 Exif segment
      const segLength = view.getUint16(offset, false);
      if (offset + segLength > length || segLength < 14) return 1;

      // Check 'Exif\0\0' (0x45786966 followed by 0x0000)
      const exifHeader = view.getUint32(offset + 2, false);
      const exifZero = view.getUint16(offset + 6, false);
      if (exifHeader !== 0x45786966 || exifZero !== 0x0000) return 1;

      // TIFF Header starts at offset + 8
      const tiffOffset = offset + 8;
      if (tiffOffset + 8 > length) return 1;

      const endianness = view.getUint16(tiffOffset, false);
      const isLittle = endianness === 0x4949; // 'II' (Intel little-endian)
      if (!isLittle && endianness !== 0x4d4d) return 1; // 'MM' (Motorola big-endian)

      // TIFF Magic Number 42 (0x002A)
      if (view.getUint16(tiffOffset + 2, isLittle) !== 0x002a) return 1;

      const firstIFDOffset = view.getUint32(tiffOffset + 4, isLittle);
      let dirOffset = tiffOffset + firstIFDOffset;
      if (dirOffset + 2 > length) return 1;

      const entries = view.getUint16(dirOffset, isLittle);
      dirOffset += 2;

      for (let i = 0; i < entries; i++) {
        const entryOffset = dirOffset + i * 12;
        if (entryOffset + 12 > length) return 1;

        const tag = view.getUint16(entryOffset, isLittle);
        if (tag === 0x0112) {
          // Tag 0x0112 is Orientation
          const orientation = view.getUint16(entryOffset + 8, isLittle);
          return orientation >= 1 && orientation <= 8 ? orientation : 1;
        }
      }
      return 1;
    } else if ((marker & 0xff00) !== 0xff00 || marker === 0xffda) {
      // SOS (Start of Scan) or non-marker byte
      break;
    } else {
      // Skip other APP markers / segments
      if (offset + 2 > length) break;
      const segLength = view.getUint16(offset, false);
      offset += segLength;
    }
  }

  return 1;
}

const exifCache = new Map<string, number>();

/**
 * Fetch partial or full image bytes to extract the EXIF orientation.
 */
export async function getExifOrientationFromUrl(url: string): Promise<number> {
  if (!url) return 1;
  if (exifCache.has(url)) {
    return exifCache.get(url)!;
  }

  try {
    let buffer: ArrayBuffer | null = null;

    // Try range request first to fetch only header (64KB)
    try {
      const resp = await fetch(url, {
        headers: { Range: "bytes=0-65535" },
        mode: "cors",
      });
      if (resp.ok || resp.status === 206) {
        buffer = await resp.arrayBuffer();
      }
    } catch {
      // Range request or CORS error fallback
    }

    if (!buffer) {
      const resp = await fetch(url, { mode: "cors" });
      if (resp.ok) {
        buffer = await resp.arrayBuffer();
      }
    }

    if (buffer) {
      const orientation = parseExifOrientation(buffer);
      exifCache.set(url, orientation);
      return orientation;
    }
  } catch (err) {
    // If CORS or network fails, fallback to 1 (default orientation)
    console.debug("Could not read EXIF from image URL:", err);
  }

  exifCache.set(url, 1);
  return 1;
}

let cachedBrowserAutoOrient: boolean | null = null;

/**
 * Detect whether the current browser automatically respects EXIF orientation
 * when rendering an <img> element.
 */
export function checkBrowserAutoOrient(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(true);
  if (cachedBrowserAutoOrient !== null) {
    return Promise.resolve(cachedBrowserAutoOrient);
  }

  return new Promise((resolve) => {
    // 2x1 JPEG image with EXIF orientation 6 (90 deg CW).
    // If the browser natively respects EXIF orientation, naturalWidth will become 1 and naturalHeight will become 2.
    const testExifBase64 =
      "data:image/jpeg;base64,/9j/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAYAAAAAAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAgMBEQACEQEDEQH/xABKAAEAAAAAAAAAAAAAAAAAAAALEAEAAAAAAAAAAAAAAAAAAAAAAQEAAAAAAAAAAAAAAAAAAAAAEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8H//2Q==";

    const img = new Image();
    img.onload = () => {
      cachedBrowserAutoOrient = img.naturalWidth === 1 && img.naturalHeight === 2;
      resolve(cachedBrowserAutoOrient);
    };
    img.onerror = () => {
      cachedBrowserAutoOrient = true;
      resolve(true);
    };
    img.src = testExifBase64;
  });
}

/**
 * Returns rotation degrees for a given EXIF orientation tag:
 * - 3: 180°
 * - 6: 90° CW
 * - 8: 270° CW (= -90°)
 */
export function getExifRotationAngle(orientation: number): number {
  switch (orientation) {
    case 3:
      return 180;
    case 6:
      return 90;
    case 8:
      return 270;
    default:
      return 0;
  }
}

export interface ImageOrientationInfo {
  orientation: number;
  rotationDegrees: number;
  needsCssRotation: boolean;
  isLoading: boolean;
}

/**
 * React hook to retrieve orientation and determine if CSS rotation is required.
 */
export function useImageOrientation(imageUrl?: string): ImageOrientationInfo {
  const [info, setInfo] = useState<ImageOrientationInfo>({
    orientation: 1,
    rotationDegrees: 0,
    needsCssRotation: false,
    isLoading: !!imageUrl,
  });

  useEffect(() => {
    if (!imageUrl) {
      setInfo({
        orientation: 1,
        rotationDegrees: 0,
        needsCssRotation: false,
        isLoading: false,
      });
      return;
    }

    let isMounted = true;

    Promise.all([getExifOrientationFromUrl(imageUrl), checkBrowserAutoOrient()])
      .then(([orientation, browserAutoOrients]) => {
        if (!isMounted) return;
        const degrees = getExifRotationAngle(orientation);
        // Only apply manual CSS rotation if browser does NOT auto-orient and orientation requires rotation
        const needsRotation = !browserAutoOrients && degrees !== 0;

        setInfo({
          orientation,
          rotationDegrees: degrees,
          needsCssRotation: needsRotation,
          isLoading: false,
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setInfo({
          orientation: 1,
          rotationDegrees: 0,
          needsCssRotation: false,
          isLoading: false,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [imageUrl]);

  return info;
}
