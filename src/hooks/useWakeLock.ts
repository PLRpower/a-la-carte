import { useState, useEffect, useCallback, useRef } from "react";

export interface UseWakeLockReturn {
  isSupported: boolean;
  isActive: boolean;
  request: () => Promise<boolean>;
  release: () => Promise<void>;
  toggle: () => void;
}

/**
 * Screen Wake Lock hook to prevent device from sleeping while cooking
 */
export function useWakeLock(enabledByDefault: boolean = true): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const shouldBeActiveRef = useRef(enabledByDefault);

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && "wakeLock" in navigator);
  }, []);

  const request = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return false;
    }

    try {
      // If already active, release previous sentinel first
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {
          // ignore
        }
      }

      const sentinel = await (navigator as any).wakeLock.request("screen");
      wakeLockRef.current = sentinel;
      setIsActive(true);
      shouldBeActiveRef.current = true;

      sentinel.addEventListener("release", () => {
        wakeLockRef.current = null;
        setIsActive(false);
      });

      return true;
    } catch (err) {
      console.warn("Screen Wake Lock request failed:", err);
      setIsActive(false);
      return false;
    }
  }, []);

  const release = useCallback(async (): Promise<void> => {
    shouldBeActiveRef.current = false;
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn("Screen Wake Lock release failed:", err);
      }
      wakeLockRef.current = null;
    }
    setIsActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (isActive) {
      release();
    } else {
      request();
    }
  }, [isActive, request, release]);

  // Manage visibility change (re-request wake lock when user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && shouldBeActiveRef.current) {
        request();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [request]);

  // Automatically request on mount if enabledByDefault
  useEffect(() => {
    if (enabledByDefault && isSupported) {
      request();
    }

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [enabledByDefault, isSupported, request]);

  return {
    isSupported,
    isActive,
    request,
    release,
    toggle,
  };
}
