/**
 * Shared response helpers used across API routes.
 */
import { NextResponse } from "next/server";

/** Apply Cache-Control: no-store to any NextResponse containing sensitive data. */
export function noStore<T>(response: NextResponse<T>): NextResponse<T> {
  response.headers.set("Cache-Control", "no-store");
  return response;
}

/** Convenience: build a JSON error response with no-store. */
export function errorResponse(message: string, status: number): NextResponse {
  const res = NextResponse.json({ error: message }, { status });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
