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
export default function Embroidery({
  setPage,
  setSelectedProduct,
  setSelectedBusiness,
  setSelectedReel,
  setCurrentReels,

  setViewAllTitle,
  setViewAllProducts,

  setViewAllBusinessTitle,
  setViewAllBusinesses,

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
  const { data: embroideryProducts = [], loading: load_embroideryProducts } = useAsync(() => listProducts('embroidery'));
  const { data: embroideryBusinesses = [], loading: load_embroideryBusinesses } = useAsync(() => listBusinesses('embroidery'));
  const { data: embroideryReels = [], loading: load_embroideryReels } = useAsync(() => listReels('embroidery'));
const [searchText, setSearchText] = useState("");

const [filters, setFilters] = useState({



  distance: "Anywhere",
  price: "All",
});

  if (load_embroideryProducts || load_embroideryBusinesses || load_embroideryReels) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;
const filteredEmbroideryProducts = embroideryProducts.filter((shop) => {
  const matchesSearch =
    shop.name.toLowerCase().includes(searchText.toLowerCase());

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

  return matchesSearch && matchesPrice && matchesDistance;
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
    onClick={() => setPage("handmade")}
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
  🎨 Handmade
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
  placeholder="Search embroidery..."
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
  background: item.name === "Handmade" ? "#5A1848" : "#fff",
  color: item.name === "Handmade" ? "#fff" : "#35142E",
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
  title="Beautiful Embroidery Creations 🧵"
  subtitle="Hoops • Tote Bags • Shirts • Home Decor"
  emoji="🧵"
  color1="#B85C5C"
  color2="#F7D6D6"
/>
{/* EMBROIDERY SECTION */}

<h2
  style={{
    marginTop: "34px",
    marginBottom: "6px",
    color: "#35142E",
    fontSize: "28px",
  }}
>
  🧵 Embroidery
</h2>

<p
  style={{
    marginTop: 0,
    marginBottom: "22px",
    color: "#777",
    fontSize: "15px",
  }}
>
  Hoops • Tote Bags • Shirts • Home Decor
</p>
{/* QUICK SEARCH */}
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
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>
  {[
  "Embroidery Hoops",
  "Tote Bags",
  "T-Shirts",
  "Baby Names",
  "Wall Art",
  "Hand Towels",
  "Cushion Covers",
  "Bookmarks",
  "Table Runners",
  "Floral Designs",
  "Name Embroidery",
  "Custom Gifts",
].map((item, index) => (
    <div
  onClick={() => setSearchText(item)}
      key={index}
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
    marginTop: 35,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
   🧵 Embroidery Near You
  </h2>

  <button
  onClick={() => {
    setViewAllTitle("🧵 Embroidery Near You");
    setViewAllProducts(embroideryProducts.slice(0, 3));
    setPreviousPage("embroidery");
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
  {embroideryProducts.slice(0, 3).map((shop,index)=>(
   <ProductCard
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
    setPreviousPage("candles");
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
    setViewAllProducts(embroideryProducts.slice(3, 6));
    setPreviousPage("embroidery");
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
  {embroideryProducts.slice(3, 6).map((shop,index)=>(
    <ProductCard
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
    setPreviousPage("candles");
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
    🌱 New On Tibu
  </h2>

  <button
  onClick={() => {
  setViewAllBusinessTitle("🌱 New On Tibu");
  setViewAllBusinesses(embroideryBusinesses);
  setPreviousPage("embroidery");
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
  {embroideryBusinesses.map((business, index) => (
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
    setPreviousPage("embroidery");
    setPage("business");
  }}
/>
  ))}
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
    🎥 Embroidery Reels
  </h2>

  <button
  onClick={() => {
  setViewAllReelsTitle("🎥 Embroidery Reels");
  setViewAllReels(embroideryReels);
  setPreviousPage("embroidery");
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
  {embroideryReels.map((reel, index) => (
  <ReelCard
    key={index}
    reel={reel}
    caption={reel.caption}
    emoji={reel.emoji}

    savedReels={savedReels}
    setSavedReels={setSavedReels}

    onClick={() => {
      setSelectedReel(reel);
      setCurrentReels(embroideryReels);
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
        marginTop: "25px",
        color: "#35142E",
        marginBottom: "8px",
      }}
    >
      🔍 Results for "{searchText}"
    </h2>

    <p
      style={{
        color: "#777",
        marginTop: 0,
        marginBottom: "25px",
      }}
    >
      {filteredEmbroideryProducts.length} product
      {filteredEmbroideryProducts.length !== 1 ? "s" : ""} found
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: "18px",
      }}
    >
      {filteredEmbroideryProducts.map((shop, index) => (
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

      {filteredEmbroideryProducts.length === 0 && (
        <p
          style={{
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