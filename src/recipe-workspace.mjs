/**
 * Standalone adaptation of recipeSessions.ts from the private prmpt. app.
 * No UI framework, network connection, backend or production records.
 */
export function createRecipeSession(workspaceId, recipe, latestRequest, latestResponse) {
  return {
    workspaceId,
    original: structuredClone(recipe),
    current: structuredClone(recipe),
    latestRequest,
    latestResponse,
  };
}

export function appendSession(sessions, session) {
  return [...sessions, session];
}

export function refineCapturedSession(sessions, targetWorkspaceId, nextRecipe, request, response) {
  return sessions.map((session) => {
    if (session.workspaceId !== targetWorkspaceId) return session;
    // Preserve the application's stable recipe-card identity, not an AI-generated ID.
    return {
      ...session,
      current: { ...structuredClone(nextRecipe), id: session.current.id },
      latestRequest: request,
      latestResponse: response,
    };
  });
}

export function answerForCapturedSession(sessions, targetWorkspaceId, question, response) {
  return sessions.map((session) => session.workspaceId === targetWorkspaceId
    ? { ...session, latestRequest: question, latestResponse: response }
    : session);
}
