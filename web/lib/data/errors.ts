import "server-only";

/** An error whose message is safe and helpful to show to the user. */
export class UserFacingError extends Error {}

/**
 * Logs a database error without its details (which can contain the values
 * of the failing row) and returns a readable error.
 */
export function dbError(context: string, error: { code?: string } | null): UserFacingError {
  console.error(`[costwatch] ${context} failed`, error?.code ?? "unknown");
  return new UserFacingError(`We couldn't ${context}. Please try again.`);
}
