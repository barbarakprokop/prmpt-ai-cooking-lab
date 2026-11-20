/**
 * Standalone adaptation of the app's retry identity decision.
 * Idempotency keys identify requests. They are NEVER authorization secrets.
 */
export function getOrCreatePendingRequest(previous, message, targetWorkspaceId) {
  if (previous?.message === message && previous.targetWorkspaceId === targetWorkspaceId) {
    return previous;
  }
  return {
    idempotencyKey: crypto.randomUUID(),
    message,
    targetWorkspaceId,
  };
}
