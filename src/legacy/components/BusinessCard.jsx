export default function BusinessCard({
  business,
  name,
  category,
  area,
  image,
  color,
  onViewBusiness,

  savedBusinesses,
  setSavedBusinesses,
}) {
  return (
    <div
      style={{
        minWidth: "210px",
        background: "#fff",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        cursor: "pointer",
      }}
    >
     <div
  style={{
    height: "140px",
    background: color,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "65px",
    position: "relative",
  }}
>
 <button
  onClick={() => {
    const alreadySaved = savedBusinesses.some(
      (item) => item.businessName === business.businessName
    );

    if (alreadySaved) {
      setSavedBusinesses(
        savedBusinesses.filter(
          (item) => item.businessName !== business.businessName
        )
      );
    } else {
      setSavedBusinesses([...savedBusinesses, business]);
    }
  }}
  style={{
    position: "absolute",
    top: "12px",
    right: "12px",
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
  {savedBusinesses.some(
  (item) => item.businessName === business.businessName
)
  ? "❤️"
  : "🤍"}
</button>
        {image}
      </div>

      <div style={{ padding: "16px" }}>
        <h3
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "18px",
            fontWeight: "600",
            color: "#35142E",
          }}
        >
          {name}
        </h3>

        <p
          style={{
            marginTop: "10px",
            marginBottom: "4px",
            textAlign: "center",
            color: "#777",
            fontSize: "14px",
          }}
        >
          🍰 {category}
        </p>

        <p
          style={{
            margin: 0,
            textAlign: "center",
            color: "#999",
            fontSize: "14px",
          }}
        >
          📍 {area}
        </p>

        <button
          onClick={onViewBusiness}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "13px",
            border: "none",
            borderRadius: "16px",
            background: "#5A1848",
            color: "white",
            fontWeight: "600",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          View Business
        </button>
      </div>
    </div>
  );
}