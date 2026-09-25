export default function Banner({
  title,
  subtitle,
  color1,
  color2,
  emoji,
}) {
  return (
    <div
      style={{
        marginTop: "24px",
        marginBottom: "26px",
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
        borderRadius: "26px",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        boxShadow: "0 10px 25px rgba(0,0,0,.10)",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
          }}
        >
          {title}
        </h2>

        <p
          style={{
            marginTop: "10px",
            marginBottom: "18px",
            opacity: .95,
            lineHeight: "22px",
          }}
        >
          {subtitle}
        </p>

        <button
          style={{
            border: "none",
            background: "white",
            color: "#5A1848",
            padding: "12px 20px",
            borderRadius: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Shop Now →
        </button>
      </div>

      <div
        style={{
          fontSize: "72px",
        }}
      >
        {emoji}
      </div>
    </div>
  );
}