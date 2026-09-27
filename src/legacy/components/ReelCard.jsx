export default function ReelCard({
  reel,
  caption,
  emoji,
  onClick,

  savedReels,
  setSavedReels,
}) {
  return (
    <div
     onClick={onClick}
      style={{
        width: "200px",
        minWidth: "170px",
        height: "290px",
        borderRadius: "24px",
        background: "linear-gradient(180deg,#FAD8C0,#8E4D6D)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "18px",
        boxSizing: "border-box",
        color: "white",
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(0,0,0,.10)",
        flexShrink: 0,
      }}
    >
      {/* Top Icons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "22px",
        }}
      >
        <button
  onClick={(e) => {
    e.stopPropagation();

    const alreadySaved = savedReels.some(
      (item) => item.caption === reel.caption
    );

    if (alreadySaved) {
      setSavedReels(
        savedReels.filter(
          (item) => item.caption !== reel.caption
        )
      );
    } else {
      setSavedReels([...savedReels, reel]);
    }
  }}
  style={{
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    background: "#FFFFFF",
    boxShadow: "0 4px 12px rgba(0,0,0,.12)",
    cursor: "pointer",
    fontSize: "18px",
  }}
>
  {savedReels.some(
    (item) => item.caption === reel.caption
  )
    ? "❤️"
    : "🤍"}
</button>
        <span>📤</span>
      </div>

      {/* Emoji */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "82px",
        }}
      >
        {emoji}
      </div>

      {/* Bottom */}
      <div
        style={{
          minHeight: "52px",
        }}
      >
      

        <p
          style={{
            marginTop: "6px",
            marginBottom: 0,
            fontSize: "14px",
            opacity: 0.9,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {caption}
        </p>
        <div
  style={{
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    marginTop: "14px",
    padding: "8px 14px",
    background: "#F6F1F4",
    borderRadius: "22px",
    fontWeight: "600",
    fontSize: "14px",
    color: "#5A1848",
  }}
>
  ▶ Watch Reel
</div>
      </div>
    </div>
  );
}