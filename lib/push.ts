/**
 * lib/push.ts — Server-side Web Push helper
 *
 * Usage:
 *   await sendPushToUser(profileId, {
 *     title: "New Lead",
 *     body:  "John Smith wants to buy a home",
 *     url:   "/portal",
 *   });
 *
 * The helper fetches all active push subscriptions for the given employee,
 * sends a push to each one, and automatically removes expired/invalid
 * endpoints (HTTP 410 Gone responses from the push service).
 */

import webpush from "web-push";
import { createServiceClient } from "./supabase";

// Configure VAPID once — credentials live in environment variables.
// Generate with: npx web-push generate-vapid-keys
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:info@hcmgloans.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  icon?: string;
}

/**
 * Send a push notification to all active devices for a given employee.
 * Fire-and-forget safe — errors are logged but never thrown.
 */
export async function sendPushToUser(
  profileId: string,
  payload: PushPayload,
): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    // VAPID keys not configured — silently skip (dev / test environments)
    return;
  }

  const sb = createServiceClient();
  const { data: subs } = await sb
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("profile_id", profileId);

  if (!subs || subs.length === 0) return;

  const message = JSON.stringify({
    title: payload.title,
    body:  payload.body,
    url:   payload.url   ?? "/portal",
    icon:  payload.icon  ?? "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  });

  const expiredIds: string[] = [];

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          message,
        );
        // Update last_used_at so we can detect stale subscriptions
        await sb
          .from("push_subscriptions")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", sub.id);
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) {
          // Subscription expired — mark for removal
          expiredIds.push(sub.id);
        } else {
          console.error("[push] send error:", err);
        }
      }
    })
  );

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await sb.from("push_subscriptions").delete().in("id", expiredIds);
  }
}

/**
 * Send a push notification to all employees who have queue access
 * (ops team members). Used for new Lift Off request notifications.
 */
export async function sendPushToQueueUsers(payload: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const sb = createServiceClient();

  // Fetch all active profiles that have any liftoff_roles
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, liftoff_roles, role")
    .eq("is_active", true);

  if (!profiles) return;

  const queueUserIds = profiles
    .filter(p =>
      p.role === "admin" ||
      p.role === "developer" ||
      (Array.isArray(p.liftoff_roles) && p.liftoff_roles.length > 0)
    )
    .map(p => p.id);

  await Promise.allSettled(
    queueUserIds.map((id) => sendPushToUser(id, payload))
  );
}
