import { listReels } from "./services/reelService";
import { listBusinesses } from "./services/businessService";
import { listProducts } from "./services/productService";
import { useAsync } from "./hooks/useAsync";
import { useState } from "react";

import ProductCard from "./Components/ProductCard";
import BusinessCard from "./Components/BusinessCard";
import ReelCard from "./Components/ReelCard";
import Banner from "./Components/Banner";
import SearchBar from "./Components/SearchBar";
export default function WomenFashion({
  setPage,
  setSelectedProduct,
  setSelectedBusiness,
  setSelectedReel,
  setCurrentReels,

  setViewAllTitle,
  setViewAllProducts,

  setViewAllBusinesses,
  setViewAllBusinessTitle,

  setViewAllReels,
  setViewAllReelsTitle,

  setPreviousPage,

  savedProducts,
  setSavedProducts,
  savedBusinesses,
setSavedBusinesses,
savedReels,
setSavedReels,
}) {
  const { data: womenFashionProducts = [], loading: load_womenFashionProducts } = useAsync(() => listProducts('women-fashion'));
  const { data: womenFashionBusinesses = [], loading: load_womenFashionBusinesses } = useAsync(() => listBusinesses('women-fashion'));
  const { data: womenFashionReels = [], loading: load_womenFashionReels } = useAsync(() => listReels('women-fashion'));
  const [searchText, setSearchText] = useState("");
const [filters, setFilters] = useState({


  distance: "Anywhere",
  price: "All",
});

  if ( load_womenFashionProducts || load_womenFashionBusinesses || load_womenFashionReels) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
const filteredWomenFashionProducts =
  womenFashionProducts.filter((shop) => {
    const matchesSearch =
      shop.name.toLowerCase().includes(searchText.toLowerCase()) ||
      shop.seller.toLowerCase().includes(searchText.toLowerCase());

    const price = shop.price;

    let matchesPrice = true;

    if (filters.price === "Under ₹250")
      matchesPrice = price < 250;
    else if (filters.price === "₹250–500")
      matchesPrice = price >= 250 && price <= 500;
    else if (filters.price === "₹500–1000")
      matchesPrice = price >= 500 && price <= 1000;
    else if (filters.price === "₹1000+")
      matchesPrice = price > 1000;

    let distance = 2.5;

    let matchesDistance = true;

    if (filters.distance === "Within 2 km")
      matchesDistance = distance <= 2;
    else if (filters.distance === "Within 5 km")
      matchesDistance = distance <= 5;
    else if (filters.distance === "Within 10 km")
      matchesDistance = distance <= 10;
    else if (filters.distance === "Within 15 km")
      matchesDistance = distance <= 15;

    return (
      matchesSearch &&
      matchesPrice &&
      matchesDistance
    );
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
   {/* Back Button */}
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "16px",
  }}
>
  <button
    onClick={() => setPage("fashion")}
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

{/* Heading */}
<h1
  style={{
    margin: 0,
    textAlign: "center",
    color: "#35142E",
    fontSize: "32px",
    fontWeight: "700",
  }}
>
  👗 Fashion
</h1>

<p
  style={{
    marginTop: "8px",
    marginBottom: "28px",
    textAlign: "center",
    color: "#777",
    fontSize: "15px",
  }}
>
 📍 Bandra, Mumbai
</p>
{/* SEARCH */}
<SearchBar
  placeholder="Search kurtis, dresses..."
  initialValue={searchText}
  onSearch={setSearchText}
  hideCategoryFilter={true}
  onApplyFilters={setFilters}
/>
{/* CATEGORY SWITCHER */}

<div
  style={{
    display: "flex",
    gap: "14px",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "10px",
    marginBottom: "30px",

    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>
  {[
    { name: "Desserts", emoji: "🍰", page: "desserts" },
    { name: "Fashion", emoji: "👗", page: "fashion" },
    { name: "Handmade", emoji: "🎨", page: "handmade" },
    { name: "Jewellery", emoji: "💍", page: "jewellery" },
    { name: "Crochet", emoji: "🧶", page: "crochet" },
    { name: "Gifts", emoji: "🎁", page: "gifts" },
  ].map((item, index) => (
    <div
      key={item.name}
      onClick={() => setPage(item.page)}
      style={{
  width: "169px",
  minWidth: "169px",
  height: "82px",
  background: item.name === "Fashion" ? "#5A1848" : "#fff",
  color: item.name === "Fashion" ? "#fff" : "#35142E",
  borderRadius: "22px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  boxShadow: "0 6px 16px rgba(0,0,0,.08)",
  cursor: "pointer",
  flexShrink: 0,
}}
    >
      <div
        style={{
          fontSize: "28px",
          marginBottom: "6px",
        }}
      >
        {item.emoji}
      </div>

      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {item.name}
      </div>
    </div>
  ))}
</div>
{searchText === "" &&
filters.distance === "Anywhere" &&
filters.price === "All" && (
  <>
<Banner
  title="Latest Women's Fashion ✨"
  subtitle="Kurtis • Dresses • Co-ords • Tops"
  emoji="👗"
  color1="#8E4D6D"
  color2="#F8C9D8"
/>

{/* QUICK SEARCH */}

<div
  style={{
    display: "flex",
    gap: "12px",
    overflowX: "auto",
    overflowY: "hidden",
    whiteSpace: "nowrap",
    paddingTop: "22px",
    paddingBottom: "12px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>
  {[
    "Kurti",
    "Dress",
    "Co-ord Set",
    "Top",
    "Jeans",
    "Shirt",
    "Saree",
    "Crop Top",
    "Skirt",
    "Gown",
    "Palazzo",
    "Ethnic Wear",
  ].map((item, index) => (
    <div
      key={index}
      onClick={() => setSearchText(item)}
      style={{
        padding: "13px 22px",
        background: "white",
        border: "1px solid #EFE4EB",
        borderRadius: "18px",
        fontWeight: "600",
        color: "#5A1848",
        whiteSpace: "nowrap",
        cursor: "pointer",
        boxShadow: "0 4px 12px rgba(0,0,0,.05)",
        flexShrink: 0,
      }}
    >
      {item}
    </div>
  ))}
</div>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 34,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    👗 Women's Fashion Near You
  </h2>

  <button
onClick={() => {
  setViewAllTitle("👗 Women's Fashion Near You");
  setViewAllProducts(womenFashionProducts.slice(0, 3));
  setPreviousPage("womenfashion");
  setPage("productsviewall");
  }}
    style={{
      border: "none",
      background: "none",
      color: "#7A4E6B",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    <span
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      View All →
    </span>
  </button>
</div>

<div
  style={{
    display: "flex",
    overflowX: "auto",
    gap: "18px",
    paddingTop: "18px",
    paddingBottom: "10px",
    scrollbarWidth: "none",
  }}
>
  {womenFashionProducts.slice(0, 3).map((shop, index) => (
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
    setPreviousPage("home");
    setPage("product");
  }}
/>
  ))}
</div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🔥 Popular Right Now
  </h2>

  <button
onClick={() => {
  setViewAllTitle("🔥 Popular Right Now");
  setViewAllProducts(womenFashionProducts.slice(3, 6));
  setPreviousPage("womenfashion");
  setPage("productsviewall");
}}
  >
    <span
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      View All →
    </span>
  </button>
</div>

<div
  style={{
    display: "flex",
    overflowX: "auto",
    gap: "18px",
    paddingTop: "18px",
    paddingBottom: "10px",
    scrollbarWidth: "none",
  }}
>
  {womenFashionProducts.slice(3, 6).map((shop, index) => (
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
    setPreviousPage("home");
    setPage("product");
  }}
/>
  ))}
</div>
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🌱 New on Tibu
  </h2>

  <button
 onClick={() => {
  setViewAllBusinessTitle("🌱 New On Tibu");
  setViewAllBusinesses(womenFashionBusinesses);
  setPreviousPage("womenfashion");
  setPage("businessViewAll");
}}
    style={{
      border: "none",
      background: "none",
      color: "#7A4E6B",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    <span
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      View All →
    </span>
  </button>
</div>

<div
  style={{
    display: "flex",
    overflowX: "auto",
    gap: "16px",
    paddingTop: "18px",
    paddingBottom: "10px",
    scrollbarWidth: "none",
  }}
>
  {womenFashionBusinesses.map((business, index) => (
  <BusinessCard
  business={business}

  name={business.businessName}
  category={business.category}
  area={business.location}
  image={business.businessEmoji}
  color="#FFE6EE"

  savedBusinesses={savedBusinesses}
  setSavedBusinesses={setSavedBusinesses}

  onViewBusiness={() => {
    setSelectedBusiness(business);
    setPreviousPage("womenfashion");
    setPage("business");
  }}
/>
))
 }
</div>
{/* ================= DESSERT REELS ================= */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🎥 Women's Fashion Reels
  </h2>

  <button
  onClick={() => {
  setViewAllReelsTitle("🎥 Women's Fashion Reels");
  setViewAllReels(womenFashionReels);
  setPreviousPage("womenfashion");
  setPage("reelsviewall");
}}
    style={{
      border: "none",
      background: "none",
      color: "#7A4E6B",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    <span
      style={{
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    >
      View All →
    </span>
  </button>
</div>

<div
  style={{
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    overflowY: "hidden",
    paddingTop: "18px",
    paddingBottom: "10px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>
 {womenFashionReels.map((reel, index) => (
  <ReelCard
    key={index}
    reel={reel}
    caption={reel.caption}
    emoji={reel.emoji}

    savedReels={savedReels}
    setSavedReels={setSavedReels}

    onClick={() => {
      setSelectedReel(reel);
      setCurrentReels(womenFashionReels);
      setPage("reel");
    }}
  />
))}
</div>
</>
)}

{(
  searchText ||
  filters.distance !== "Anywhere" ||
  filters.price !== "All"
) && (
  <>
    <h2
      style={{
        marginTop: "30px",
        color: "#35142E",
      }}
    >
      🔍 Results for "{searchText}"
    </h2>

    <p
      style={{
        color: "#777",
        marginBottom: "25px",
      }}
    >
      {filteredWomenFashionProducts.length}{" "}
      product
      {filteredWomenFashionProducts.length !== 1 ? "s" : ""}
      found
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: "18px",
      }}
    >
      {filteredWomenFashionProducts.map((shop, index) => (
          <ProductCard
            key={index}
            name={shop.name}
            seller={shop.seller}
            price={shop.price}
            rating={shop.rating}
            distance={shop.distance}
            emoji={shop.emoji}
            color1={shop.color1}
            color2={shop.color2}
            onViewProduct={() => {
  setSelectedProduct(shop);
  setPage("product");
}}
          />
        ))}

      {filteredWomenFashionProducts.length === 0 && (
        <p
  style={{
    gridColumn: "1 / -1",
    textAlign: "center",
    color: "#777",
  }}
>
  No products found.
</p>
      )}
    </div>
  </>
)}
</div>
);
}