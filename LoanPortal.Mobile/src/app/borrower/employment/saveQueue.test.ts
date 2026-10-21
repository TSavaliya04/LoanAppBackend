import { describe, it, expect } from "vitest";
import { createSaveQueue } from "./saveQueue";

/** A save function whose calls resolve only when the test says so. */
function controllableSave() {
  const calls: { payload: string; resolve: (id: string | null) => void; reject: (e: Error) => void }[] = [];
  const save = (payload: string) =>
    new Promise<string | null>((resolve, reject) => {
      calls.push({ payload, resolve, reject });
    });
  return { calls, save };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("createSaveQueue", () => {
  it("does not start the second save until the first finishes", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save);
    q.enqueue((id) => `step2:${id}`);
    q.enqueue((id) => `step3:${id}`);
    await tick();
    expect(calls.map((c) => c.payload)).toEqual(["step2:null"]);
    calls[0].resolve("draft-1");
    await tick();
    expect(calls.map((c) => c.payload)).toEqual(["step2:null", "step3:draft-1"]);
  });

  it("keeps the latest draftId returned by the backend", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save);
    q.enqueue(() => "a");
    await tick();
    calls[0].resolve("draft-1");
    await q.flush();
    expect(q.getDraftId()).toBe("draft-1");
  });

  it("keeps the existing draftId when the backend returns none", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save, "draft-0");
    q.enqueue(() => "a");
    await tick();
    calls[0].resolve(null);
    await q.flush();
    expect(q.getDraftId()).toBe("draft-0");
  });

  it("flush waits for every queued save", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save);
    q.enqueue(() => "a");
    q.enqueue(() => "b");
    let flushed = false;
    const f = q.flush().then(() => (flushed = true));
    await tick();
    calls[0].resolve("d");
    await tick();
    expect(flushed).toBe(false);
    calls[1].resolve("d");
    await f;
    expect(flushed).toBe(true);
  });

  it("a failed save does not stop later saves", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save, "draft-0");
    q.enqueue(() => "a");
    q.enqueue((id) => `b:${id}`);
    await tick();
    calls[0].reject(new Error("network"));
    await tick();
    expect(calls[1]?.payload).toBe("b:draft-0");
    calls[1].resolve("draft-0");
    await expect(q.flush()).resolves.toBeUndefined();
  });

  it("setDraftId updates the id used by later saves", async () => {
    const { calls, save } = controllableSave();
    const q = createSaveQueue(save);
    q.setDraftId("hydrated");
    q.enqueue((id) => `x:${id}`);
    await tick();
    expect(calls[0].payload).toBe("x:hydrated");
  });
});
