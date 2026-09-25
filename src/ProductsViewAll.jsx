
import ProductCard from "./Components/ProductCard";

export default function ProductsViewAll({
  title,
  products,
  setPage,
  setSelectedProduct,
  availableTodayCategory,
  setAvailableTodayCategory,
  previousPage,

  savedProducts,
  setSavedProducts,
}){
 const showCategoryChips = title === "⭐ Available Today";

const selectedCategory = showCategoryChips
  ? availableTodayCategory
  : "All";

  const categoryChips = [
    "All",
    "Desserts",
    "Fashion",
    "Handmade",
    "Jewellery",
    "Crochet",
    "Gifts",
  ];

const filteredProducts = products.filter((product) => {
  if (selectedCategory === "All") return true;

  const page = (product.page || "").toLowerCase();

  switch (selectedCategory) {
    case "Desserts":
      return page === "desserts";

    case "Fashion":
      return page === "menfashion" || page === "womenfashion";

    case "Handmade":
      return (
        page === "crochet" ||
        page === "resin" ||
        page === "candles" ||
        page === "embroidery"
      );

    case "Jewellery":
      return page === "jewellery";

    case "Crochet":
      return page === "crochet";

    case "Gifts":
      return page === "gifts";

    default:
      return true;
  }
});

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
          justifyContent: "flex-start",
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
          marginBottom: "24px",
        }}
      >
        {filteredProducts.length} products
      </p>

      {showCategoryChips && (
  <div
    style={{
      display: "flex",
      gap: "12px",
      overflowX: "auto",
      overflowY: "hidden",
      whiteSpace: "nowrap",
      paddingBottom: "12px",
      paddingLeft: "2px",
      paddingRight: "2px",
      marginBottom: "25px",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      WebkitOverflowScrolling: "touch",
    }}
  >
    {categoryChips.map((chip) => (
      <div
        key={chip}
        onClick={() => setAvailableTodayCategory(chip)}
        style={{
          padding: "13px 22px",
          background:
            selectedCategory === chip
              ? "#5A1848"
              : "white",
          color:
            selectedCategory === chip
              ? "white"
              : "#5A1848",
          border: "1px solid #EFE4EB",
          borderRadius: "18px",
          fontWeight: "600",
          whiteSpace: "nowrap",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,.05)",
          flexShrink: 0,
          transition: "0.2s",
        }}
      >
        {chip}
      </div>
    ))}
  </div>
)}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "18px",
        }}
      >
        {filteredProducts.map((shop, index) => (
          <ProductCard
  key={index}
  product={shop}
  name={shop.name}
  seller={shop.seller}
  price={shop.price}
  rating={shop.rating}
  distance={shop.distance}
  emoji={shop.emoji}
  color1={shop.color1}
  color2={shop.color2}
  savedProducts={savedProducts}
  setSavedProducts={setSavedProducts}
  onViewProduct={() => {
    setSelectedProduct(shop);
    setPage("product");
  }}
/>
        ))}
      </div>
    </div>
  );
}