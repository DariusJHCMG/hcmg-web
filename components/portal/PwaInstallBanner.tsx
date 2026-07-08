"use client";

import { useEffect, useState } from "react";

// BeforeInstallPromptEvent is not in standard TS lib
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "hcmg-pwa-install-dismissed";

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow]     = useState(false);
  const [isIos, setIsIos]   = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Don't show if user already dismissed
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // iOS Safari — no beforeinstallprompt, show manual instructions instead
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as unknown as Record<string, unknown>).MSStream;
    if (ios) {
      // Only show on Safari (not Chrome iOS which can't install)
      const isSafari = /safari/i.test(ua) && !/crios|fxios|opios/i.test(ua);
      if (isSafari) {
        setIsIos(true);
        setShow(true);
      }
      return;
    }

    // Chrome/Edge/Android — capture the prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Register service worker
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {/* silent */});
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShow(false);
  }

  async function install() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setShow(false);
  }

  if (!show || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      {/* Accent bar */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#142850,#F37021)" }} />

      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <img src="/icons/icon-192.png" alt="HCMG" className="h-12 w-12 flex-shrink-0 rounded-xl border border-line shadow-sm" />

        {/* Text */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-ink leading-tight">Add HCMG to your home screen</p>
          {isIos ? (
            <p className="mt-1 text-xs text-muted leading-relaxed">
              Tap the <strong className="text-ink">Share</strong> button in Safari, then <strong className="text-ink">Add to Home Screen</strong>.
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted">
              Install the portal as an app — fast access, no browser needed.
            </p>
          )}
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 rounded-lg p-1 text-muted hover:bg-sand hover:text-ink transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Action */}
      {!isIos && (
        <div className="border-t border-line px-4 py-3">
          <button
            onClick={install}
            className="w-full rounded-xl py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#142850,#1e3a6e)" }}
          >
            Install App
          </button>
        </div>
      )}
    </div>
  );
}
