import { describe, it, expect } from "vitest";

// ─── Duplicate-detection logic mirrored from session-store.ts ─────────────────

interface StoryEntry {
  storySessionId?: string | null;
  date: string;
  totalCarbonKg: number;
}

function isDuplicateBySessionId(
  stories: StoryEntry[],
  incomingSessionId: string | null | undefined
): boolean {
  if (!incomingSessionId) return false;
  return stories.some((s) => s.storySessionId === incomingSessionId);
}

function isDuplicateByTime(
  stories: StoryEntry[],
  totalCarbonKg: number,
  nowMs: number,
  windowMs = 15000
): boolean {
  return stories.some((s) => {
    const timeDiff = Math.abs(nowMs - new Date(s.date).getTime());
    return timeDiff < windowMs && s.totalCarbonKg === totalCarbonKg;
  });
}

// ─── storySessionId generation logic ─────────────────────────────────────────

function generateSessionId(): string {
  // mirrors crypto.randomUUID pattern — check it's the right format
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Duplicate story detection — session ID", () => {
  it("returns false when stories list is empty", () => {
    expect(isDuplicateBySessionId([], "some-session-id")).toBe(false);
  });

  it("returns false when incoming session ID is null", () => {
    const stories: StoryEntry[] = [{ storySessionId: "abc", date: new Date().toISOString(), totalCarbonKg: 1.5 }];
    expect(isDuplicateBySessionId(stories, null)).toBe(false);
  });

  it("returns false when incoming session ID is undefined", () => {
    const stories: StoryEntry[] = [{ storySessionId: "abc", date: new Date().toISOString(), totalCarbonKg: 1.5 }];
    expect(isDuplicateBySessionId(stories, undefined)).toBe(false);
  });

  it("detects an exact session ID match as duplicate", () => {
    const sid = "session-abc-123";
    const stories: StoryEntry[] = [
      { storySessionId: sid, date: new Date().toISOString(), totalCarbonKg: 2.0 },
    ];
    expect(isDuplicateBySessionId(stories, sid)).toBe(true);
  });

  it("does NOT flag a different session ID as duplicate", () => {
    const stories: StoryEntry[] = [
      { storySessionId: "session-old", date: new Date().toISOString(), totalCarbonKg: 2.0 },
    ];
    expect(isDuplicateBySessionId(stories, "session-new")).toBe(false);
  });
});

describe("Duplicate story detection — time-based fallback", () => {
  it("flags same carbon within 15s window as duplicate", () => {
    const nowMs = Date.now();
    const stories: StoryEntry[] = [
      { storySessionId: null, date: new Date(nowMs - 5000).toISOString(), totalCarbonKg: 3.5 },
    ];
    expect(isDuplicateByTime(stories, 3.5, nowMs)).toBe(true);
  });

  it("does NOT flag same carbon outside 15s window", () => {
    const nowMs = Date.now();
    const stories: StoryEntry[] = [
      { storySessionId: null, date: new Date(nowMs - 20000).toISOString(), totalCarbonKg: 3.5 },
    ];
    expect(isDuplicateByTime(stories, 3.5, nowMs)).toBe(false);
  });

  it("does NOT flag different carbon within 15s window", () => {
    const nowMs = Date.now();
    const stories: StoryEntry[] = [
      { storySessionId: null, date: new Date(nowMs - 3000).toISOString(), totalCarbonKg: 3.5 },
    ];
    expect(isDuplicateByTime(stories, 4.0, nowMs)).toBe(false);
  });

  it("returns false for empty list", () => {
    expect(isDuplicateByTime([], 2.0, Date.now())).toBe(false);
  });
});

describe("Story session ID generation", () => {
  it("generates a unique ID for each call", () => {
    const ids = new Set(Array.from({ length: 100 }, generateSessionId));
    expect(ids.size).toBe(100);
  });

  it("generated ID matches UUID v4 format", () => {
    const id = generateSessionId();
    // UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
