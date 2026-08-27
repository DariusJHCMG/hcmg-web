/**
 * /offline — served by the service worker when the network is unavailable
 * and the requested URL is not in the cache.
 * Must be fully static — no server-side data fetching.
 */
export default function OfflinePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#F8FAFC",
      fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif",
      padding: "32px 24px",
      textAlign: "center",
    }}>
      {/* Logo */}
      <div style={{
        width: 64, height: 64, borderRadius: 16, marginBottom: 24,
        background: "linear-gradient(135deg,#FF9847,#F37021)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, fontWeight: 900, color: "#fff",
      }}>
        H
      </div>

      <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: "#F37021", marginBottom: 10 }}>
        Harris Capital Mortgage Group
      </p>

      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#1A2B42", marginBottom: 10, lineHeight: 1.2 }}>
        You&apos;re offline
      </h1>

      <p style={{ fontSize: 14, color: "#64748B", marginBottom: 32, maxWidth: 320, lineHeight: 1.6 }}>
        Check your internet connection and try again. Your data will be waiting when you reconnect.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          padding: "14px 32px", borderRadius: 14,
          background: "linear-gradient(135deg,#FF9847,#F37021)",
          color: "#fff", fontSize: 15, fontWeight: 800,
          border: "none", cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 8px 24px rgba(243,112,33,0.3)",
        }}
      >
        Try Again
      </button>

      <p style={{ marginTop: 40, fontSize: 11, color: "#CBD5E1" }}>
        Harris Capital Mortgage Group, LLC · NMLS# 1918223
      </p>
    </div>
  );
}
