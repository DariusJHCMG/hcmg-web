/**
 * goal-engine-server.ts
 * Server-side barrel: re-exports from goal-engine.ts and goal-engine-emails.ts
 * so API routes have a single clean import.
 */

export * from "./goal-engine";
export * from "./goal-engine-emails";
