import { useState, useEffect } from "react";

export default function App() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("checking"); // checking | live | offline

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

  useEffect(() => {
    fetch(`${API_URL}/`)
      .then((res) => (res.ok ? setApiStatus("live") : setApiStatus("offline")))
      .catch(() => setApiStatus("offline"));
  }, [API_URL]);

  const wordCount = review.trim() ? review.trim().split(/\s+/).length : 0;

  const analyzeSentiment = async (e) => {
    e.preventDefault();
    if (!review.trim()) {
      setError("Please enter or choose a product review before running inference.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Prediction failed.");
      } else {
        setApiStatus("live");
        setResult(data);
        setHistory((prev) => [
          {
            text: review,
            ...data,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
          ...prev.slice(0, 4),
        ]);
      }
    } catch {
      setApiStatus("offline");
      setError("Backend API unreachable. Start Flask server locally or wait 30s for Render wake-up.");
    } finally {
      setLoading(false);
    }
  };

  const quickSamples = [
    {
      label: "Positive",
      symbol: "▲",
      symbolColor: "#14d18b",
      text: "Beautiful HD display and super fast performance! Easily the best value tablet I have bought.",
    },
    {
      label: "Neutral",
      symbol: "●",
      symbolColor: "#f59e0b",
      text: "The screen size is great for reading books, though the web browser feels slightly sluggish.",
    },
    {
      label: "Negative",
      symbol: "▼",
      symbolColor: "#ef4444",
      text: "Stopped charging after two days and the battery drains terribly fast. Complete waste of money.",
    },
  ];

  const verdictStyles = {
    Positive: {
      accent: "#14d18b",
      bg: "rgba(20, 209, 139, 0.08)",
      border: "rgba(20, 209, 139, 0.3)",
      symbol: "▲",
      note: "High positive polarity — strong customer approval detected.",
    },
    Neutral: {
      accent: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.08)",
      border: "rgba(245, 158, 11, 0.3)",
      symbol: "●",
      note: "Balanced or mixed polarity — probability lies inside the neutral band (40%–65%).",
    },
    Negative: {
      accent: "#ef4444",
      bg: "rgba(239, 68, 68, 0.08)",
      border: "rgba(239, 68, 68, 0.3)",
      symbol: "▼",
      note: "Negative polarity — critical defect or dissatisfaction signal detected.",
    },
  };

  return (
    <div style={styles.page}>
      {/* Subtle Top-Left Emerald Radial Glow */}
      <div style={styles.ambientGlow} />

      <div style={styles.wrapper}>
        {/* TOP NAVBAR */}
        <header style={styles.navbar}>
          <div style={styles.brandGroup}>
            <div style={styles.logoBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14d18b" strokeWidth="2">
                <path d="M4 8V6a2 2 0 0 1 2-2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
                <circle cx="11.5" cy="11.5" r="2.5" />
                <path d="m13.5 13.5 2 2" />
              </svg>
            </div>
            <div>
              <div style={styles.brandName}>Sentiment-Analyzer</div>
              <div style={styles.brandSub}>Product review intelligence</div>
            </div>
          </div>
        </header>

        {/* HERO SECTION (Left-Aligned) */}
        <section style={styles.hero}>
          <div style={styles.eyebrowRow}>
            <span style={styles.eyebrowLine} />
            <span style={styles.eyebrowText}>SENTIMENT CLASSIFICATION / 01</span>
          </div>

          <h1 style={styles.heroTitle}>
            <span style={styles.heroWhite}>Read between</span>
            <br />
            <span style={styles.heroGreen}>the reactions.</span>
          </h1>

          <div style={styles.heroBottomRow}>
            <p style={styles.heroDesc}>
              Turn raw customer language into a clear polarity signal. Paste a review, run the
              model, and see what your customers are really saying.
            </p>

            <div style={styles.techCallout}>
              <span style={styles.promptIcon}>&gt;_</span>
              <div style={styles.techText}>
                TF-IDF +
                <br />
                LOGISTIC REGRESSION
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONSOLE CARD */}
        <main style={styles.consoleCard}>
          <div style={styles.cardHeader}>
            <div style={styles.cardTitleGroup}>
              <span style={styles.stepNum}>01</span>
              <div>
                <h2 style={styles.cardTitle}>Customer review</h2>
                <p style={styles.cardSubtitle}>Give the model something to read</p>
              </div>
            </div>

            <div
              style={{
                ...styles.modeBadge,
                borderColor:
                  apiStatus === "live"
                    ? "rgba(20, 209, 139, 0.35)"
                    : apiStatus === "checking"
                    ? "rgba(245, 158, 11, 0.35)"
                    : "rgba(239, 68, 68, 0.35)",
                color:
                  apiStatus === "live"
                    ? "#14d18b"
                    : apiStatus === "checking"
                    ? "#f59e0b"
                    : "#ef4444",
              }}
            >
              <span>✦</span>
              <span>
                {apiStatus === "live"
                  ? "LIVE MODEL"
                  : apiStatus === "checking"
                  ? "CONNECTING"
                  : "API OFFLINE"}
              </span>
            </div>
          </div>

          <form onSubmit={analyzeSentiment}>
            <div style={styles.editorMetaRow}>
              <span style={styles.monoLabel}>REVIEW TEXT</span>
              <span style={styles.monoCounter}>
                {review.length} chars • {wordCount} words
              </span>
            </div>

            <textarea
              rows={6}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Paste an Amazon product review here..."
              style={styles.textarea}
            />

            <div style={styles.hintRow}>
              <span style={styles.hintIcon}>?</span>
              <span>Be specific. Details about quality, speed, or defects create clearer signals.</span>
            </div>

            {/* QUICK START SAMPLES */}
            <div style={styles.quickStartSection}>
              <div style={styles.quickStartHeader}>
                <span style={styles.monoLabel}>QUICK START</span>
                <div style={styles.dividerLine} />
              </div>

              <div style={styles.sampleGrid}>
                {quickSamples.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setReview(item.text);
                      setError("");
                    }}
                    style={styles.sampleCard}
                  >
                    <span style={styles.sampleLeft}>
                      <span style={{ color: item.symbolColor, fontSize: "10px" }}>{item.symbol}</span>
                      <span>{item.label}</span>
                    </span>
                    <span style={styles.arrowIcon}>↗</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BAR */}
            <div style={styles.actionBar}>
              <button
                type="button"
                onClick={() => {
                  setReview("");
                  setResult(null);
                  setError("");
                }}
                style={styles.clearButton}
              >
                <span>⌫</span>
                <span>Clear</span>
              </button>

              <button type="submit" disabled={loading} style={styles.analyzeButton}>
                <span>⚡</span>
                <span>{loading ? "Analyzing..." : "Analyze sentiment"}</span>
                <span>↗</span>
              </button>
            </div>
          </form>

          {error && <div style={styles.errorBanner}>{error}</div>}

          {/* OUTPUT RESULT SECTION */}
          {result && (
            <div
              style={{
                ...styles.resultBox,
                background: verdictStyles[result.sentiment].bg,
                borderColor: verdictStyles[result.sentiment].border,
              }}
            >
              <div style={styles.resultTop}>
                <div>
                  <div style={styles.monoLabel}>02 / POLARITY OUTPUT</div>
                  <div
                    style={{
                      ...styles.verdictHeading,
                      color: verdictStyles[result.sentiment].accent,
                    }}
                  >
                    {verdictStyles[result.sentiment].symbol} {result.sentiment.toUpperCase()}
                  </div>
                </div>
                <div style={styles.probTag}>
                  P(y=1|x) = {(result.positive_score / 100).toFixed(3)}
                </div>
              </div>

              <p style={styles.verdictNote}>{verdictStyles[result.sentiment].note}</p>

              <div style={styles.meterGrid}>
                <div>
                  <div style={styles.meterLabelRow}>
                    <span>Positive Signal</span>
                    <span style={{ color: "#14d18b", fontFamily: "'JetBrains Mono', monospace" }}>
                      {result.positive_score}%
                    </span>
                  </div>
                  <div style={styles.meterTrack}>
                    <div
                      style={{
                        ...styles.meterFill,
                        width: `${result.positive_score}%`,
                        background: "#14d18b",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div style={styles.meterLabelRow}>
                    <span>Negative Signal</span>
                    <span style={{ color: "#ef4444", fontFamily: "'JetBrains Mono', monospace" }}>
                      {result.negative_score}%
                    </span>
                  </div>
                  <div style={styles.meterTrack}>
                    <div
                      style={{
                        ...styles.meterFill,
                        width: `${result.negative_score}%`,
                        background: "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* RECENT LOGS */}
        {history.length > 0 && (
          <section style={styles.logSection}>
            <div style={styles.quickStartHeader}>
              <span style={styles.monoLabel}>INFERENCE LOG</span>
              <div style={styles.dividerLine} />
            </div>
            <div style={styles.logList}>
              {history.map((item, index) => (
                <div key={index} style={styles.logRow}>
                  <span
                    style={{
                      ...styles.logPill,
                      color: verdictStyles[item.sentiment].accent,
                      borderColor: verdictStyles[item.sentiment].border,
                    }}
                  >
                    {item.sentiment.toUpperCase()}
                  </span>
                  <span style={styles.logText}>{item.text}</span>
                  <span style={styles.logTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FOOTER */}
        <footer style={styles.footer}>
          <div style={styles.footerLeft}>
            <span style={styles.footerBrand}>Sentiment-Analyzer</span>
            <span style={styles.footerSep}>·</span>
            <span></span>
          </div>
          <div style={styles.footerRight}>
            <span><b>Built in TG311</b></span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#07090d",
    color: "#f3f4f6",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    overflowX: "hidden",
    padding: "0 24px",
    boxSizing: "border-box",
    textAlign: "left",
  },
  ambientGlow: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "520px",
    height: "420px",
    background: "radial-gradient(circle, rgba(20, 209, 139, 0.11) 0%, rgba(7, 9, 13, 0) 70%)",
    pointerEvents: "none",
  },
  wrapper: {
    maxWidth: "1060px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
    textAlign: "left",
  },
  navbar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "22px 0",
    borderBottom: "1px solid #161b24",
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
  },
  logoBox: {
    width: "34px",
    height: "34px",
    borderRadius: "8px",
    backgroundColor: "rgba(20, 209, 139, 0.08)",
    border: "1px solid rgba(20, 209, 139, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "14px",
    fontWeight: 700,
    color: "#f9fafb",
  },
  brandSub: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  },
  hero: {
    padding: "64px 0 48px",
    textAlign: "left",
  },
  eyebrowRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: "12px",
    marginBottom: "22px",
  },
  eyebrowLine: {
    width: "24px",
    height: "1.5px",
    backgroundColor: "#14d18b",
  },
  eyebrowText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.14em",
    color: "#9ca3af",
  },
  heroTitle: {
    margin: "0 0 28px",
    fontSize: "clamp(42px, 6.5vw, 72px)",
    fontWeight: 800,
    lineHeight: 1.03,
    letterSpacing: "-0.035em",
    textAlign: "left",
  },
  heroWhite: {
    color: "#f3f4f6",
  },
  heroGreen: {
    color: "#14d18b",
  },
  heroBottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: "24px",
    textAlign: "left",
  },
  heroDesc: {
    margin: 0,
    maxWidth: "540px",
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#9ca3af",
    textAlign: "left",
  },
  techCallout: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    lineHeight: 1.5,
    color: "#6b7280",
    textAlign: "right",
  },
  promptIcon: {
    color: "#14d18b",
    fontWeight: 700,
  },
  techText: {
    letterSpacing: "0.06em",
  },
  consoleCard: {
    maxWidth: "740px",
    margin: "12px auto 0",
    backgroundColor: "#0c0f15",
    border: "1px solid #1b202b",
    borderRadius: "16px",
    padding: "28px",
    boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65)",
    textAlign: "left",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "24px",
  },
  cardTitleGroup: {
    display: "flex",
    alignItems: "baseline",
    gap: "12px",
  },
  stepNum: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#4b5563",
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 700,
    color: "#f3f4f6",
  },
  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#6b7280",
  },
  modeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    padding: "5px 11px",
    borderRadius: "999px",
    backgroundColor: "rgba(20, 209, 139, 0.06)",
    border: "1px solid",
  },
  editorMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  monoLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.12em",
    color: "#6b7280",
  },
  monoCounter: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#6b7280",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#080a0e",
    border: "1px solid #1b202b",
    borderRadius: "10px",
    padding: "16px",
    color: "#f3f4f6",
    fontSize: "14px",
    lineHeight: 1.6,
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    resize: "vertical",
  },
  hintRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "10px",
    fontSize: "12px",
    color: "#6b7280",
  },
  hintIcon: {
    width: "15px",
    height: "15px",
    borderRadius: "50%",
    border: "1px solid #4b5563",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    flexShrink: 0,
  },
  quickStartSection: {
    marginTop: "24px",
  },
  quickStartHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "12px",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#161b24",
  },
  sampleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },
  sampleCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    backgroundColor: "#0e1219",
    border: "1px solid #1b202b",
    borderRadius: "8px",
    color: "#d1d5db",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
  sampleLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  arrowIcon: {
    color: "#4b5563",
    fontSize: "12px",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "22px",
    paddingTop: "16px",
    borderTop: "1px solid #141922",
  },
  clearButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    background: "transparent",
    border: "none",
    color: "#6b7280",
    fontSize: "13px",
    cursor: "pointer",
    padding: "8px 10px",
  },
  analyzeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#14d18b",
    color: "#04130d",
    border: "none",
    borderRadius: "8px",
    padding: "11px 20px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 0 24px rgba(20, 209, 139, 0.25)",
  },
  errorBanner: {
    marginTop: "18px",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    color: "#fca5a5",
    fontSize: "13px",
  },
  resultBox: {
    marginTop: "22px",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid",
  },
  resultTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  verdictHeading: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "22px",
    fontWeight: 800,
    marginTop: "4px",
  },
  probTag: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#d1d5db",
    backgroundColor: "#080a0e",
    border: "1px solid #1b202b",
    padding: "6px 10px",
    borderRadius: "6px",
  },
  verdictNote: {
    margin: "8px 0 16px",
    fontSize: "13px",
    color: "#9ca3af",
  },
  meterGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  meterLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#9ca3af",
    marginBottom: "6px",
  },
  meterTrack: {
    height: "6px",
    borderRadius: "999px",
    backgroundColor: "#080a0e",
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: "999px",
    transition: "width 0.35s ease",
  },
  logSection: {
    maxWidth: "740px",
    margin: "28px auto 0",
  },
  logList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  logRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 14px",
    backgroundColor: "#0c0f15",
    border: "1px solid #161b24",
    borderRadius: "8px",
    fontSize: "12px",
  },
  logPill: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 8px",
    borderRadius: "4px",
    border: "1px solid",
    flexShrink: 0,
  },
  logText: {
    color: "#9ca3af",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    flex: 1,
  },
  logTime: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#4b5563",
    flexShrink: 0,
  },
  footer: {
    marginTop: "72px",
    padding: "24px 0 32px",
    borderTop: "1px solid #161b24",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "11px",
    color: "#6b7280",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  },
  footerBrand: {
    color: "#d1d5db",
    fontWeight: 600,
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#9ca3af",
  },
  footerSep: {
    color: "#374151",
  },
};