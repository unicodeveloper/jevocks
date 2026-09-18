import type { CSSProperties } from "react";

const colors = {
  background: "#020302",
  panel: "#080a08",
  line: "#292c29",
  muted: "#73766f",
  text: "#efefe9",
  amber: "#ffb000",
  green: "#4ed477",
  purple: "#9b7cff",
};

const flex: CSSProperties = { display: "flex" };

export function SocialCard({ height }: { height: number }) {
  const compact = height < 620;

  return (
    <div
      style={{
        ...flex,
        width: "100%",
        height: "100%",
        position: "relative",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: "monospace",
      }}
    >
      <div
        style={{
          ...flex,
          position: "absolute",
          inset: 0,
          opacity: 0.35,
          backgroundImage:
            "linear-gradient(#111511 1px, transparent 1px), linear-gradient(90deg, #111511 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        style={{
          ...flex,
          position: "absolute",
          top: -180,
          right: -90,
          width: 600,
          height: 600,
          borderRadius: 600,
          background: "radial-gradient(circle, rgba(155,124,255,0.15), rgba(2,3,2,0) 68%)",
        }}
      />

      <header
        style={{
          ...flex,
          height: 74,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${colors.line}`,
          padding: "0 54px",
          backgroundColor: "rgba(5,6,5,0.88)",
        }}
      >
        <div style={{ ...flex, alignItems: "center" }}>
          <div
            style={{
              ...flex,
              alignItems: "center",
              justifyContent: "center",
              width: 68,
              height: 32,
              marginRight: 18,
              backgroundColor: colors.amber,
              color: "#080908",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            JVNK
          </div>
          <div style={{ ...flex, fontSize: 18, fontWeight: 700, letterSpacing: "0.04em" }}>
            JEVINIK TERMINAL
          </div>
        </div>
        <div style={{ ...flex, alignItems: "center", fontSize: 13, letterSpacing: "0.12em" }}>
          <span style={{ color: colors.muted, marginRight: 25 }}>30D EQUITY MODEL</span>
          <span style={{ color: colors.green }}>● LIVE</span>
        </div>
      </header>

      <main
        style={{
          ...flex,
          flex: 1,
          alignItems: "center",
          padding: compact ? "38px 54px 34px" : "42px 54px 38px",
        }}
      >
        <section
          style={{
            ...flex,
            width: 650,
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 48,
          }}
        >
          <div
            style={{
              ...flex,
              marginBottom: 22,
              color: colors.amber,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.17em",
            }}
          >
            EVIDENCE → EVALUATION → DECISION
          </div>
          <div
            style={{
              ...flex,
              flexDirection: "column",
              fontSize: compact ? 58 : 61,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.055em",
            }}
          >
            <span>Make the call.</span>
            <span style={{ color: colors.amber }}>See the evidence.</span>
          </div>
          <div
            style={{
              ...flex,
              maxWidth: 570,
              marginTop: 24,
              color: "#9a9c96",
              fontSize: 20,
              lineHeight: 1.45,
            }}
          >
            Live market intelligence and a structured 30-day outlook, evaluated by Jev.
          </div>
          <div style={{ ...flex, alignItems: "center", marginTop: 30 }}>
            {["US + EU EQUITIES", "VALYU DATA", "JEV EVALUATION"].map((label, index) => (
              <div
                key={label}
                style={{
                  ...flex,
                  marginRight: index === 2 ? 0 : 10,
                  border: `1px solid ${index === 2 ? colors.purple : "#3a3d39"}`,
                  padding: "9px 12px",
                  color: index === 2 ? "#c4afff" : "#8c8e88",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            ...flex,
            width: 410,
            height: compact ? 386 : 402,
            flexDirection: "column",
            border: `1px solid ${colors.line}`,
            backgroundColor: colors.panel,
          }}
        >
          <div
            style={{
              ...flex,
              height: 48,
              flexShrink: 0,
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${colors.line}`,
              padding: "0 18px",
              fontSize: 12,
              letterSpacing: "0.1em",
            }}
          >
            <span style={{ color: colors.amber, fontWeight: 700 }}>DECISION SUMMARY</span>
            <span style={{ color: colors.muted }}>JEV ENGINE</span>
          </div>

          <div style={{ ...flex, flexDirection: "column", padding: "22px 22px 17px" }}>
            <div style={{ ...flex, justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ ...flex, flexDirection: "column" }}>
                <span style={{ color: colors.muted, fontSize: 11, letterSpacing: "0.12em" }}>
                  P(HIGHER IN 30 DAYS)
                </span>
                <span style={{ marginTop: 5, color: colors.green, fontSize: 66, fontWeight: 700, lineHeight: 1 }}>
                  71%
                </span>
              </div>
              <div style={{ ...flex, flexDirection: "column", alignItems: "flex-end", paddingBottom: 6 }}>
                <span style={{ color: colors.muted, fontSize: 11 }}>OUTLOOK</span>
                <span style={{ marginTop: 7, color: colors.green, fontSize: 16, fontWeight: 700 }}>● BULLISH</span>
              </div>
            </div>

            <div
              style={{
                ...flex,
                position: "relative",
                height: 90,
                marginTop: 20,
                borderTop: "1px solid #202320",
                borderBottom: "1px solid #202320",
              }}
            >
              <svg width="366" height="90" viewBox="0 0 366 90" style={{ position: "absolute", inset: 0 }}>
                <path d="M0 72 L40 67 L75 73 L112 52 L149 58 L188 38 L224 45 L260 25 L302 31 L366 8" fill="none" stroke="#4ed477" strokeWidth="4" />
                <path d="M0 72 L40 67 L75 73 L112 52 L149 58 L188 38 L224 45 L260 25 L302 31 L366 8 L366 90 L0 90 Z" fill="rgba(78,212,119,0.08)" />
              </svg>
            </div>

            <div style={{ ...flex, flexDirection: "column", marginTop: 18 }}>
              {[
                ["PRICE ACTION", "BULLISH", colors.green],
                ["NEWS FLOW", "NEUTRAL", colors.amber],
                ["ANALYST VIEWS", "BULLISH", colors.green],
              ].map(([label, value, color]) => (
                <div
                  key={label}
                  style={{
                    ...flex,
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #191c19",
                    padding: "7px 0",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                  }}
                >
                  <span style={{ color: "#a6a8a2" }}>{label}</span>
                  <span style={{ color, fontWeight: 700 }}>● {value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer
        style={{
          ...flex,
          height: 50,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${colors.line}`,
          padding: "0 54px",
          color: "#62655f",
          fontSize: 11,
          letterSpacing: "0.11em",
        }}
      >
        <span>JEVINIK / EQUITY DECISION SYSTEM</span>
        <span style={{ color: colors.purple }}>POWERED BY VALYU EVIDENCE</span>
      </footer>
    </div>
  );
}
