/**
 * Cooking Timer Utilities
 * - Automatic duration detection in recipe instructions
 * - Web Audio API melodic alarm chime
 * - PWA vibration & Web Notification support
 */

export interface DetectedDuration {
  raw: string;
  totalSeconds: number;
  label: string;
  startIndex: number;
  endIndex: number;
}

export interface TextSegment {
  type: "text" | "duration";
  content: string;
  seconds?: number;
  label?: string;
}

/**
 * Parses time expressions from French/English recipe texts.
 * Examples matched:
 * - "20 min", "20 minutes", "15 mins", "5 mn"
 * - "10 à 15 min", "10-15 minutes"
 * - "1h30", "1 h 30", "1h 30 min", "2 heures", "1 heure"
 * - "45 sec", "30 secondes", "30s"
 */
export function extractDurations(text: string): DetectedDuration[] {
  if (!text) return [];

  const results: DetectedDuration[] = [];

  // Pattern 1: Hours with optional minutes (e.g. 1h30, 2 h 15 min, 1h, 2 heures)
  const hoursMinutesRegex = /\b(\d+)\s*(?:h|heures?)\s*(?:(\d+)\s*(?:min(?:utes?)?|mn)?)?\b/gi;
  let match: RegExpExecArray | null;

  while ((match = hoursMinutesRegex.exec(text)) !== null) {
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const totalSeconds = hours * 3600 + minutes * 60;
    if (totalSeconds > 0) {
      results.push({
        raw: match[0],
        totalSeconds,
        label: match[0].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }
  }

  // Pattern 2: Ranges of minutes (e.g. 10 à 15 min, 10-15 minutes)
  const rangeMinutesRegex = /\b(\d+)\s*(?:à|-)\s*(\d+)\s*(min(?:utes?|s)?|mn)\b/gi;
  while ((match = rangeMinutesRegex.exec(text)) !== null) {
    // Avoid overlap with pattern 1
    const start = match.index;
    const end = match.index + match[0].length;
    if (results.some((r) => (start >= r.startIndex && start < r.endIndex) || (end > r.startIndex && end <= r.endIndex))) {
      continue;
    }

    const maxMinutes = Math.max(parseInt(match[1], 10), parseInt(match[2], 10));
    results.push({
      raw: match[0],
      totalSeconds: maxMinutes * 60,
      label: match[0].trim(),
      startIndex: start,
      endIndex: end,
    });
  }

  // Pattern 3: Simple minutes (e.g. 20 min, 5 minutes, 15 mn)
  const minutesRegex = /\b(\d+(?:[.,]\d+)?)\s*(min(?:utes?|s)?|mn)\b/gi;
  while ((match = minutesRegex.exec(text)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    if (results.some((r) => (start >= r.startIndex && start < r.endIndex) || (end > r.startIndex && end <= r.endIndex))) {
      continue;
    }

    const minutes = parseFloat(match[1].replace(",", "."));
    const totalSeconds = Math.round(minutes * 60);
    if (totalSeconds > 0) {
      results.push({
        raw: match[0],
        totalSeconds,
        label: match[0].trim(),
        startIndex: start,
        endIndex: end,
      });
    }
  }

  // Pattern 4: Seconds (e.g. 45 sec, 30 secondes, 45s)
  const secondsRegex = /\b(\d+)\s*(sec(?:ondes?)?|s)\b/gi;
  while ((match = secondsRegex.exec(text)) !== null) {
    const start = match.index;
    const end = match.index + match[0].length;
    if (results.some((r) => (start >= r.startIndex && start < r.endIndex) || (end > r.startIndex && end <= r.endIndex))) {
      continue;
    }

    const seconds = parseInt(match[1], 10);
    if (seconds > 0) {
      results.push({
        raw: match[0],
        totalSeconds: seconds,
        label: match[0].trim(),
        startIndex: start,
        endIndex: end,
      });
    }
  }

  // Sort by starting index
  return results.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Splits text into segments of plain text and interactive duration chips.
 */
export function segmentTextWithDurations(text: string): TextSegment[] {
  if (!text) return [];

  const durations = extractDurations(text);
  if (durations.length === 0) {
    return [{ type: "text", content: text }];
  }

  const segments: TextSegment[] = [];
  let currentIndex = 0;

  for (const dur of durations) {
    if (dur.startIndex > currentIndex) {
      segments.push({
        type: "text",
        content: text.slice(currentIndex, dur.startIndex),
      });
    }

    segments.push({
      type: "duration",
      content: dur.raw,
      seconds: dur.totalSeconds,
      label: dur.label,
    });

    currentIndex = dur.endIndex;
  }

  if (currentIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(currentIndex),
    });
  }

  return segments;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Synthesizes a kitchen timer chime using Web Audio API.
 * Friendly, pleasant multi-tone sequence (E5, G#5, B5, E6).
 */
export function playKitchenChime(): void {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonious culinary chime chords
    const notes = [659.25, 830.61, 987.77, 1318.51];

    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.15);

      gain.gain.setValueAtTime(0.0001, now + index * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.15 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.15);
      osc.stop(now + index * 0.15 + 0.5);
    });
  } catch (err) {
    console.warn("Could not play kitchen chime audio:", err);
  }
}

/**
 * Triggers haptic vibration via PWA vibration API.
 */
export function triggerKitchenVibration(): void {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
  } catch (err) {
    console.warn("Vibration not supported or failed:", err);
  }
}

/**
 * Requests Notification permission if not yet decided.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch {
    return false;
  }
}

/**
 * Fires a desktop/PWA notification when timer ends.
 */
export function sendTimerNotification(title: string, body: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      tag: "cooking-timer",
    });
  } catch (err) {
    console.warn("Could not send timer notification:", err);
  }
}
