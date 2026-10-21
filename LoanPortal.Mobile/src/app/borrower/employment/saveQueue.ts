// ─── Borrower Employment – draft save queue ─────────────────────────────────
// Runs savedraft calls one at a time so each save carries the draftId returned
// by the previous one and saves reach the backend in step order.

export interface SaveQueue<P> {
  /** Queue a save; `build` receives the latest known draftId when the save starts. */
  enqueue(build: (draftId: string | null) => P): Promise<void>;
  /** Resolves once every save queued so far has finished (successfully or not). */
  flush(): Promise<void>;
  getDraftId(): string | null;
  setDraftId(id: string | null): void;
}

/**
 * @param save sends one payload and resolves with the draftId from the response (if any).
 *             Failures are swallowed: a failed draft save must not block later saves.
 */
export function createSaveQueue<P>(
  save: (payload: P) => Promise<string | null | undefined>,
  initialDraftId: string | null = null
): SaveQueue<P> {
  let draftId = initialDraftId;
  let chain: Promise<void> = Promise.resolve();

  return {
    enqueue(build) {
      chain = chain.then(async () => {
        try {
          const newId = await save(build(draftId));
          if (newId) draftId = newId;
        } catch {
          // Non-blocking: the next save still runs with the last known draftId.
        }
      });
      return chain;
    },
    flush: () => chain,
    getDraftId: () => draftId,
    setDraftId(id) {
      draftId = id;
    },
  };
}
