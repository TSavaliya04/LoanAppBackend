import { describe, expect, it } from "vitest";
import { timeAgo } from "./timeAgo";

const now = new Date("2026-10-07T12:00:00Z");
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

describe("timeAgo", () => {
  it("formats recent times", () => {
    expect(timeAgo(ago(10_000), now)).toBe("just now");
    expect(timeAgo(ago(5 * 60_000), now)).toBe("5m ago");
    expect(timeAgo(ago(3 * 3_600_000), now)).toBe("3h ago");
    expect(timeAgo(ago(2 * 86_400_000), now)).toBe("2d ago");
  });
  it("handles future and invalid input", () => {
    expect(timeAgo(ago(-5000), now)).toBe("just now");
    expect(timeAgo("nope", now)).toBe("");
  });
});
