import ReelCard from "./Components/ReelCard";

export default function ReelsViewAll({
  setPage,
  reels,
  title,
  previousPage,
  setSelectedReel,
  setCurrentReels,

  savedReels,
  setSavedReels,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF8EF",
        padding: "20px",
        paddingBottom: "120px",
        fontFamily: "Arial",
      }}
    >
      {/* Back */}
      <div
        style={{
          display: "flex",
          marginBottom: "18px",
        }}
      >
        <button
          onClick={() => setPage(previousPage)}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: "16px",
            color: "#5A1848",
            fontWeight: "600",
            padding: 0,
          }}
        >
          ← Back
        </button>
      </div>

      <h1
        style={{
          margin: 0,
          color: "#35142E",
          fontSize: "30px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: "#777",
          marginTop: "8px",
          marginBottom: "28px",
        }}
      >
        {reels.length} reels
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "18px",
        }}
      >
        {reels.map((reel, index) => (
  <ReelCard
    key={index}
    reel={reel}
    caption={reel.caption}
    emoji={reel.emoji}

    savedReels={savedReels}
    setSavedReels={setSavedReels}

    onClick={() => {
      setCurrentReels(reels);
      setSelectedReel(reel);
      setPage("reel");
    }}
  />
))}
      </div>
    </div>
  );
}