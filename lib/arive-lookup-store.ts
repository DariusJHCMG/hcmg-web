/**
 * lib/arive-lookup-store.ts
 *
 * In-memory store for pending ARIVE lookup results.
 * Keyed by requestId (generated in arive-lookup/route.ts).
 * Entries auto-expire after 60 seconds to prevent memory leaks.
 *
 * This works correctly on Vercel because the lookup + poll happen
 * within the same serverless function instance warm window (<15s).
 * If cold-start isolation becomes an issue, swap this for a
 * Supabase row with a short TTL.
 */

interface AriveResult {
  found: boolean;
  borrowerFirstName: string | null;
  borrowerLastName:  string | null;
  loanType:          string | null;
  loanAmount:        number | null;
  purchasePrice:     number | null;
  propertyAddress:   string | null;
  propertyCity:      string | null;
  propertyState:     string | null;
  propertyZip:       string | null;
  lockStatus:        "locked" | "floating" | "lock_required";
  noteRate:          number | null;
  lenderName:        string | null;
  productName:       string | null;
}

const TTL_MS = 60_000; // 60 seconds

class ResultStore {
  private store = new Map<string, { result: AriveResult; expiresAt: number }>();

  set(requestId: string, result: AriveResult): void {
    this.store.set(requestId, { result, expiresAt: Date.now() + TTL_MS });
    // Schedule cleanup
    setTimeout(() => this.store.delete(requestId), TTL_MS);
  }

  get(requestId: string): AriveResult | undefined {
    const entry = this.store.get(requestId);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(requestId);
      return undefined;
    }
    return entry.result;
  }

  delete(requestId: string): void {
    this.store.delete(requestId);
  }
}

// Singleton — shared across all route handlers in the same process
export const resultStore = new ResultStore();
