export default function ProductCard({
  product,
  name,
  seller,
  price,
  rating,
  distance,
  emoji,
  color1,
  color2,
  onViewProduct,

  savedProducts,
  setSavedProducts,
}){
  return (
    <div
      style={{
        minWidth: "260px",
        background: "#fff",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,.08)",
        cursor: "pointer",
        transition: "0.2s",
      }}
    >
      <div
  style={{
    height: "170px",
    background: `linear-gradient(135deg, ${color1}, ${color2})`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "80px",
    position: "relative",
  }}
>
  <button
  onClick={() => {
    console.log("Heart clicked");
    console.log(savedProducts);

    const alreadySaved = savedProducts.some(
      (item) => item.name === product.name
    );

    if (alreadySaved) {
      setSavedProducts(
        savedProducts.filter((item) => item.name !== product.name)
      );
    } else {
      setSavedProducts([...savedProducts, product]);
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
  {savedProducts.some(item => item.name === product.name)
    ? "❤️"
    : "🤍"}
</button>

  {emoji}
</div>

      <div style={{ padding: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
        <div
  style={{
    width: "100%",
    textAlign: "center",
  }}
>
            <h3
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: "600",
                color: "#35142E",
              }}
            >
              {name}
            </h3>
            <p
  style={{
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#777",
    fontWeight: "500",
  }}
>
  by {seller}
</p>

            <p
  style={{
    margin: "8px 0 0",
    color: "#5A1848",
    fontSize: "18px",
    fontWeight: "700",
  }}
>
  {typeof price === 'number' ? `₹${new Intl.NumberFormat('en-IN').format(price)}` : price}
</p>
          </div>

          
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
            color: "#666",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <span>⭐ {rating}</span>
          <span>📍 {distance ? distance : "2.3 km"}</span>
        </div>

        <button
          onClick={onViewProduct}
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
            letterSpacing: "0.3px",
            cursor: "pointer",
          }}
        >
          View Product
        </button>
      </div>
    </div>
  );
}