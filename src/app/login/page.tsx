"use client";

import { useSignIn } from "@clerk/nextjs";
import { FormEvent, useEffect, useState } from "react";

// ── Inject Google Fonts and styles once (client-only) ───────────────────────────
function injectAssets() {
  if (typeof document === "undefined") return;
  const fontLink = document.getElementById("jumboplan-fonts");
  if (!fontLink) {
    const link = document.createElement("link");
    link.id = "jumboplan-fonts";
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Jersey+25&display=swap";
    document.head.appendChild(link);
  }
  const styleTag = document.getElementById("jumboplan-styles");
  if (!styleTag) {
    const style = document.createElement("style");
    style.id = "jumboplan-styles";
    style.textContent = `
    @keyframes jp-spin { to { transform: rotate(360deg); } }
    .jp-orbit-ring {
      animation: jp-spin 18s linear infinite;
      transform-origin: 100.5px 98.75px;
    }
    .jp-input:focus {
      border-color: #5B9DB8 !important;
      box-shadow: 0 0 0 3px rgba(91,157,184,0.18) !important;
    }
    .jp-submit:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(91,157,184,0.5) !important;
    }
    .jp-submit:active { transform: translateY(0); }
  `;
    document.head.appendChild(style);
  }
}

// ── Sub-components ─────────────────────────────────────────────────────────────

const OrbitRing: React.FC = () => (
  <svg
    className="jp-orbit-ring"
    style={{ position: "absolute", top: 0, left: 0, width: 201, height: 197.5 }}
    viewBox="0 0 212 208"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M82.356 202.483C72.5669 200.253 63.1641 196.579 54.456 191.582M127.356 5.00098C149.723 10.1093 169.693 22.66 183.996 40.5983C198.299 58.5366 206.088 80.7996 206.088 103.742C206.088 126.685 198.299 148.948 183.996 166.886C169.693 184.824 149.723 197.375 127.356 202.483M21.3697 161.038C15.2395 152.119 10.5791 142.274 7.56598 131.878M5.00098 86.8672C6.80098 76.1797 10.266 66.0547 15.126 56.7735L17.0272 53.3422M47.5597 20.256C58.092 13.0209 69.8985 7.84475 82.356 5.00098"
      stroke="#B7D3E3"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ElephantIcon: React.FC = () => (
  <svg
    style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
    width={110}
    height={110}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M40 120H70V90H80V120H110V50H100V110H90V80H60V110H50V80H40V120ZM10 110H30V90H20V100H10V110ZM0 100H10V40H0V100ZM20 80H40V70H20V80ZM20 60H30V50H20V60ZM10 40H20V30H10V40ZM30 40H40V20H20V30H30V40ZM40 60H60V50H50V40H40V60ZM70 30H60V50H100V40H70V30ZM70 30H80V10H40V20H70V30Z"
      fill="#5C4C4C"
    />
  </svg>
);

const YellowBlock: React.FC = () => (
  <svg
    style={{
      position: "absolute",
      top: "50%",
      left: 17.5,
      transform: "translateY(calc(-50% + 10px))",
    }}
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 9H15V15H9V9ZM15 9H21V15H15V9ZM3 9H9V15H3V9ZM9 15H15V21H9V15ZM9 3H15V9H9V3Z"
      fill="#EEBE4F"
    />
    <path
      d="M9 9H15M9 9V15M9 9H3V15H9M9 9V3H15V9M15 9V15M15 9H21V15H15M15 15H9M15 15V21H9V15"
      stroke="#5C4C4C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GreenBlock: React.FC = () => (
  <svg
    style={{ position: "absolute", top: 34, left: 124.5 }}
    width={24}
    height={24}
    viewBox="0 0 30 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M26.25 11.25L26.25 18.75L18.75 18.75L18.75 11.25L26.25 11.25Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26.25 18.75L26.25 26.25L18.75 26.25L18.75 18.75L26.25 18.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M26.25 3.75L26.25 11.25L18.75 11.25L18.75 3.75L26.25 3.75Z"   fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.75 3.75L18.75 11.25L11.25 11.25L11.25 3.75L18.75 3.75Z"   fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.25 3.75L11.25 11.25L3.75 11.25L3.75 3.75L11.25 3.75Z"     fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BlueBlock: React.FC = () => (
  <svg
    style={{
      position: "absolute",
      top: 158,
      left: "calc(50% + 12px)",
      transform: "translateX(-50%)",
    }}
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 15H9V21H3V15ZM15 3H21V9H15V3ZM15 9H21V15H15V9ZM9 9H15V15H9V9ZM3 9H9V15H3V9Z"
      fill="#82CDEA"
    />
    <path
      d="M3 15H9M3 15V21H9V15M3 15V9H9M9 15H15M9 15V9M21 9V3H15V9M21 9H15M21 9V15H15M15 9V15M15 9H9"
      stroke="#5C4C4C"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── Main component ─────────────────────────────────────────────────────────────

const JumboPlanLogin: React.FC = () => {
  useEffect(() => injectAssets(), []);
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        window.location.href = "/"; // redirect after login
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* ── Logo ── */}
        <div style={styles.logoWrapper}>
          <OrbitRing />
          <ElephantIcon />
          <YellowBlock />
          <GreenBlock />
          <BlueBlock />
        </div>

        {/* ── Title ── */}
        <h1 style={styles.title}>JumboPlan</h1>

        {/* ── Form ── */}
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            className="jp-input"
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="jp-input"
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            className="jp-submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Continue"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <a href="/sign-up" style={styles.footerLink}>
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #E3F1F9 0%, #BAE3FA 100%)",
    fontFamily: "'DM Sans', sans-serif",
  } as React.CSSProperties,

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    maxWidth: 393,
    padding: 24,
    boxSizing: "border-box",
  } as React.CSSProperties,

  logoWrapper: {
    position: "relative",
    width: 201,
    height: 197.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  } as React.CSSProperties,

  title: {
    fontSize: 60,
    fontWeight: 400,
    fontFamily: "'Jersey 25', sans-serif",
    color: "#5C4C4C",
    letterSpacing: 0,
    marginBottom: 30,
    lineHeight: 1,
  } as React.CSSProperties,

  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  } as React.CSSProperties,

  input: {
    width: "100%",
    height: 61,
    padding: "16px 26px",
    borderRadius: 14,
    border: "1.5px solid rgba(255,255,255,0.9)",
    background: "rgba(255,255,255,0.65)",
    backdropFilter: "blur(10px)",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#2C3E50",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  } as React.CSSProperties,

  submitBtn: {
    width: "100%",
    padding: 15,
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #5B9DB8 0%, #7AAABB 100%)",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(91,157,184,0.4)",
    transition: "transform 0.15s, box-shadow 0.15s",
    marginTop: 4,
  } as React.CSSProperties,

  error: {
    color: "#C0392B",
    fontSize: 13,
    margin: 0,
  } as React.CSSProperties,

  footer: {
    marginTop: 18,
    fontSize: 13,
    color: "#5A7A8A",
  } as React.CSSProperties,

  footerLink: {
    color: "#5B9DB8",
    fontWeight: 600,
    textDecoration: "none",
  } as React.CSSProperties,
} as const;

export default JumboPlanLogin;