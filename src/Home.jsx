/* eslint-disable */
import { listReels } from "./services/reelService";
import { listBusinesses } from "./services/businessService";
import { listProducts } from "./services/productService";
import { useAsync } from "./hooks/useAsync";
import { useState } from "react";
import ProductCard from "./Components/ProductCard";
import BusinessCard from "./Components/BusinessCard";
import SearchBar from "./Components/SearchBar";
const fashionProducts = [
  ...womenFashionProducts,
  ...menFashionProducts,
];

const fashionBusinesses = [
  ...womenFashionBusinesses,
  ...menFashionBusinesses,
];

const handmadeBusinesses = [
  ...crochetBusinesses,
  ...resinBusinesses,
  ...candleBusinesses,
  ...embroideryBusinesses,
];

export default function Home({
  setPage,
  searchText,
  setSearchText,
  addresses,
setAddresses,
 
  setSelectedProduct,
  setSelectedBusiness,

  setViewAllBusinesses,
  setViewAllBusinessTitle,

  setViewAllTitle,
  setViewAllProducts,

  setPreviousPage,
  filters,
setFilters,
 savedProducts,
  setSavedProducts,
   savedBusinesses,
  setSavedBusinesses,
}) {
  const { data: candleProducts = [], loading: load_candleProducts } = useAsync(() => listProducts('candle'));
  const { data: crochetProducts = [], loading: load_crochetProducts } = useAsync(() => listProducts('crochet'));
  const { data: dessertsProducts = [], loading: load_dessertsProducts } = useAsync(() => listProducts('desserts'));
  const { data: embroideryProducts = [], loading: load_embroideryProducts } = useAsync(() => listProducts('embroidery'));
  const { data: fashionProducts = [], loading: load_fashionProducts } = useAsync(() => listProducts('fahion'));
  const { data: giftsProducts = [], loading: load_giftsProducts } = useAsync(() => listProducts('gifts'));
  const { data: handmadeProducts = [], loading: load_handmadeProducts } = useAsync(() => listProducts('handmade'));
  const { data: jewelleryProducts = [], loading: load_jewelleryProducts } = useAsync(() => listProducts('jewellery'));
  const { data: menFashionProducts = [], loading: load_menFashionProducts } = useAsync(() => listProducts('men-fashion'));
  const { data: resinProducts = [], loading: load_resinProducts } = useAsync(() => listProducts('rein'));
  const { data: womenFashionProducts = [], loading: load_womenFashionProducts } = useAsync(() => listProducts('women-fashion'));
  const { data: candleBusinesses = [], loading: load_candleBusinesses } = useAsync(() => listBusinesses('candle'));
  const { data: crochetBusinesses = [], loading: load_crochetBusinesses } = useAsync(() => listBusinesses('crochet'));
  const { data: dessertBusinesses = [], loading: load_dessertBusinesses } = useAsync(() => listBusinesses('desert'));
  const { data: embroideryBusinesses = [], loading: load_embroideryBusinesses } = useAsync(() => listBusinesses('embroidery'));
  const { data: jewelleryBusinesses = [], loading: load_jewelleryBusinesses } = useAsync(() => listBusinesses('jewellery'));
  const { data: menFashionBusinesses = [], loading: load_menFashionBusinesses } = useAsync(() => listBusinesses('men-fashion'));
  const { data: resinBusinesses = [], loading: load_resinBusinesses } = useAsync(() => listBusinesses('rein'));
  const { data: womenFashionBusinesses = [], loading: load_womenFashionBusinesses } = useAsync(() => listBusinesses('women-fashion'));
  if (load_candleProducts || load_crochetProducts || load_dessertsProducts || load_embroideryProducts || load_fashionProducts || load_giftsProducts || load_handmadeProducts || load_jewelleryProducts || load_menFashionProducts || load_resinProducts || load_womenFashionProducts || load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;

        

const allProducts = [
  ...dessertsProducts,
  ...womenFashionProducts,
  ...menFashionProducts,
  ...jewelleryProducts,
  ...crochetProducts,
  ...embroideryProducts,
  ...resinProducts,
  ...candleProducts,
  ...giftsProducts,
];

  const availableTodayProducts = allProducts.filter(
    (product) => product.availableToday
  );
  const filteredProducts = allProducts.filter((item) => {
  const matchesSearch =
    searchText === "" ||
    (item.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
    (item.seller || "").toLowerCase().includes(searchText.toLowerCase());

  let matchesCategory = true;

  if (filters.category !== "All") {
    if (filters.category === "Handmade") {
      matchesCategory = [
        "crochet",
        "embroidery",
        "resin",
        "candles",
      ].includes((item.page || "").toLowerCase());
    } else if (filters.category === "Fashion") {
      matchesCategory = [
        "womenfashion",
        "menfashion",
      ].includes((item.page || "").toLowerCase());
    } else {
      matchesCategory =
        (item.page || "").toLowerCase() ===
        filters.category.toLowerCase();
    }
  }

  const price = item.price;

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
    matchesCategory &&
    matchesPrice &&
    matchesDistance
  );
});


  const categories = [
  { name: "Desserts", icon: "🍰", color: "#FFE4D6", page: "desserts" },
  { name: "Handmade", icon: "🎨", color: "#DDF4E7", page: "handmade" },
  { name: "Fashion", icon: "👗", color: "#E8DEFF", page: "fashion" },
  { name: "Jewellery", icon: "💍", color: "#FFF0C9", page: "jewellery" },
  { name: "Crochet", icon: "🧶", color: "#FFE8F1", page: "crochet" },
  { name: "Gifts", icon: "🎁", color: "#E2F2FF", page: "gifts" },
];
const selectedAddress =
  (addresses || []).find((address) => address.selected) ||
  (addresses || [])[0];

const displayAddress =
  selectedAddress?.address ||
  "Mumbai, Maharashtra";

  return (
    <div style={styles.page}>
      {/* ================= HEADER ================= */}

<div
  style={{
    position: "relative",
    width: "100%",
    minHeight: "78px",
    marginBottom: "28px",
  }}
>
  {/* ================= LEFT SIDE ================= */}

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      paddingTop: "2px",
    }}
  >
    {/* GREETING */}

    <h2
      style={{
        ...styles.greeting,
        margin: 0,
        lineHeight: "38px",
      }}
    >
      Good Afternoon 👋
    </h2>

    {/* FULL SELECTED ADDRESS */}

    <div
      onClick={() => setPage("addresses")}
      style={{
        marginTop: "5px",
        color: "#5A1848",
        fontSize: "14px",
        fontWeight: "400",
        lineHeight: "20px",
        whiteSpace: "nowrap",
        maxWidth: "750px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span>📍</span>

      <span>{displayAddress}</span>

      <span
        style={{
          fontSize: "11px",
          fontWeight: "400",
          marginLeft: "2px",
        }}
      >
        ▼ 
      </span>
    </div>
  </div>

  {/* ================= TIBU ================= */}

  <h1
    style={{
      position: "absolute",
      left: "50%",
      top: "-7px",
      transform: "translateX(-50%)",
      margin: 0,
      fontSize: "34px",
      fontWeight: "900",
      letterSpacing: "5px",
      color: "#5A1848",
      userSelect: "none",
      pointerEvents: "none",
      lineHeight: "42px",
    }}
  >
    TIBU
  </h1>

  {/* ================= RIGHT SIDE ================= */}

  <div
    style={{
      position: "absolute",
      right: 0,
      top: "-2px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }}
  >
    {/* NOTIFICATION */}

    <div
      onClick={() => setPage("notification")}
      style={{
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        background: "#fff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        cursor: "pointer",
      }}
    >
      🔔
    </div>

    {/* PROFILE */}

    <div style={styles.profile}>
      👩
    </div>
  </div>
</div>

{/* ================= SEARCH ================= */}

<SearchBar
  placeholder="Search brownies, crochet, jewellery..."
  initialValue={searchText}
  onSearch={(text) => setSearchText(text)}
  onSubmit={(text) => {
    setSearchText(text);
    setPage("search");
  }}
  onApplyFilters={(newFilters) => {
    setFilters(newFilters);
    setPage("search");
  }}
/>
      {/* ================= HERO BANNER ================= */}

<div
  style={{
    marginTop: "22px",
    background: "linear-gradient(135deg,#5A1848,#6F2358)",
    borderRadius: "24px",
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,.08)",
  }}
>
  <div style={{ maxWidth: "65%" }}>
    <h2
      style={{
        margin: 0,
        color: "white",
        fontSize: "28px",
        lineHeight: "34px",
      }}
    >
      Discover Homegrown Businesses
    </h2>

    <p
      style={{
        marginTop: "12px",
        color: "#F2DDEB",
        lineHeight: "22px",
      }}
    >
      Shop local, support talented creators and discover unique products made with love.
    </p>

    <button
     style={{
  marginTop: "18px",
  background: "white",
  color: "#5A1848",
  border: "none",
  padding: "12px 22px",
  borderRadius: "14px",
  fontWeight: "700",
  cursor: "pointer",
}}
    >
      Explore Now
    </button>
  </div>

  <div
    style={{
  fontSize: "72px",
  opacity: 0.95,
}}
  >
    🏡🛍️
  </div>
</div>
{/* ================= AVAILABLE TODAY ================= */}

<div
onClick={() => {
  setViewAllTitle("⭐ Available Today");
  setViewAllProducts(availableTodayProducts);
  setPreviousPage("home");
  setPage("productsviewall");
}}
  style={{
    marginTop: "18px",
    background: "#fff",
    borderRadius: "22px",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,.06)",
    border: "1px solid #F1E5ED",
    cursor: "pointer",
  }}
>
  {/* Left Side */}
  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
    <div
      style={{
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "#F8EAF3",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
      }}
    >
      ⭐
    </div>

    <div>
      <h3
        style={{
          margin: 0,
          color: "#35142E",
          fontSize: "18px",
          fontWeight: "700",
        }}
      >
        Available Today
      </h3>

      <p
        style={{
          margin: "6px 0 0",
          color: "#777",
          fontSize: "14px",
        }}
      >
        18 businesses are accepting orders today.
      </p>
    </div>
  </div>

  {/* Right Side */}
  <div
    style={{
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      background: "#5A1848",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      fontSize: "18px",
      fontWeight: "700",
    }}
  >
    →
  </div>
</div>
  
{/* CATEGORY TITLE */}
      <h3 style={styles.title}>Browse Categories</h3>

      {/* CATEGORY GRID */}
      <div style={styles.grid}>
        {categories.map((item) => (
          <div
  key={item.name}
  onClick={() => setPage(item.page)}
  style={{
    ...styles.card,
    background: item.color,
    cursor: "pointer",
  }}
>
            <div style={styles.icon}>{item.icon}</div>
            <p style={styles.cardText}>{item.name}</p>
          </div>
        ))}
        
        
      </div>
      
      
      {/* ================= NEWLY JOINED ================= */}

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
  setViewAllBusinesses([
    dessertBusinesses[0],
    crochetBusinesses[0],
    jewelleryBusinesses[0],
    fashionBusinesses[0],
  ]);

  setViewAllBusinessTitle("🌱 New On Tibu");
  setPreviousPage("home");
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
textDecoration:"underline",
textUnderlineOffset:"3px"
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
  }}
>
  {[
  dessertBusinesses[0],
  crochetBusinesses[0],
  jewelleryBusinesses[0],
  fashionBusinesses[0],
].map((business, index) => (
  <BusinessCard
  key={index}
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
    setPreviousPage("home");
    setPage("business");
  }}
/>
))}
</div>

<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:35}}>
  <h2 style={{margin:0,color:"#35142E"}}>🔥 Popular Right Now</h2>

  <button
 onClick={() => {
  setViewAllTitle("🔥 Popular Right Now");

  setViewAllProducts([
    dessertsProducts[0],
    crochetProducts[0],
    jewelleryProducts[0],
    fashionProducts[0],
  ]);

  setPreviousPage("home");
  setPage("productsviewall");
}}
  style={{
    border:"none",
    background:"none",
    color:"#7A4E6B",
    fontWeight:"600",
    cursor:"pointer"
  }}
>
  <span
    style={{
      textDecoration:"underline",
      textUnderlineOffset:"3px"
    }}
  >
    View All →
  </span>
</button>
</div>



<div
style={{
display:"flex",
overflowX:"auto",
msOverflowStyle:"none",
scrollbarWidth:"none",
gap:"18px",
paddingTop:"18px",
paddingBottom:"10px",
scrollbarWidth:"none"
}}
>

{[
  dessertsProducts[0],
  crochetProducts[0],
  jewelleryProducts[0],
  fashionProducts[0],
].map((shop, index) => (
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
{/* ================= DESSERTS ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>🍰 Featured Desserts</h2>

  <button
  onClick={() => setPage("desserts")}
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
textDecoration:"underline",
textUnderlineOffset:"3px"
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
  {dessertsProducts.slice(0,3).map((shop,index)=>(
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
{/* ================= FASHION ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    👗 Featured Fashion
  </h2>

  <button
  onClick={() => setPage("fashion")}
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
textDecoration:"underline",
textUnderlineOffset:"3px"
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
{[
  menFashionProducts[0],
  womenFashionProducts[0],
  menFashionProducts[1],
].map((shop, index) => (
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
{/* ================= HANDMADE ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🧶 Featured Handmade
  </h2>

  <button
  onClick={() => setPage("handmade")}
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
textDecoration:"underline",
textUnderlineOffset:"3px"
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
  {handmadeProducts.slice(0,3).map((shop,index)=>(
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
{/* ================= JEWELLERY ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    💍 Featured Jewellery
  </h2>

  <button
  onClick={() => setPage("jewellery")}
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
textDecoration:"underline",
textUnderlineOffset:"3px"
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
  {jewelleryProducts.slice(0,3).map((shop,index)=>(
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
{/* ================= CROCHET ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🧶 Featured Crochet
  </h2>

  <button
    onClick={() => setPage("crochet")}
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
  {crochetProducts.slice(0,3).map((shop,index)=>(
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
{/* ================= GIFTS ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
  }}
>
  <h2 style={{ margin: 0, color: "#35142E" }}>
    🎁 Featured Gifts
  </h2>

  <button
    onClick={() => setPage("gifts")}
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
  {giftsProducts.slice(0,3).map((shop,index)=>(
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

{/* ================= FEATURED COLLECTIONS ================= */}

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 35,
  }}
>
  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
  }}
>
  <h2
    style={{
      margin: 0,
      color: "#9B9B9B",
    }}
  >
    🔒 Featured Collections
  </h2>

  <span
    style={{
      background: "#EAEAEA",
      color: "#777",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "600",
    }}
  >
    Coming Soon
  </span>
</div>

  <button
  style={{
    border: "none",
    background: "none",
    color: "#B0B0B0",
    fontWeight: "600",
    cursor: "not-allowed",
    textDecoration: "underline",
  }}
>
  View All →
</button>
</div>

<div
  style={{
    display: "flex",
    overflowX: "auto",
    gap: "16px",
    paddingTop: "18px",
    paddingBottom: "10px",
  }}
>

{[
{
title:"🎂 Birthday Specials",
color:"#FFE3D5"
},
{
title:"🎁 Gift Hampers",
color:"#E2F2FF"
},
{
title:"💕 Wedding Favours",
color:"#FFE8F1"
},
{
title:"🌙 Ramadan Specials",
color:"#DDF4E7"
}
].map((item,index)=>(

<div
key={index}
style={{
minWidth:"220px",
height:"120px",
background:item.color,
borderRadius:"20px",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontWeight:"bold",
fontSize:"20px",
color:"#35142E",
boxShadow:"0 8px 18px rgba(0,0,0,.06)",
filter: "grayscale(100%)",
opacity: 0.6,
cursor: "not-allowed"
}}
>
{item.title}
</div>

))}

</div>
</div>

);
}

const styles = {
  page: {
  minHeight: "100vh",
  background: "#FFF8EF",
  padding: 20,
  paddingBottom: "120px",   // ← Add this
  fontFamily: "Arial, sans-serif",
},

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  location: {
    margin: 0,
    color: "#777",
    fontSize: 14,
  },

  greeting: {
    marginTop: 6,
    color: "#5A1848",
  },
profile: {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "#F7E8EF",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontSize: 26,
  border: "2px solid white",
},

  searchBox: {
    background: "white",
    borderRadius: 25,
    padding: 16,
    color: "#999",
    marginBottom: 25,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  title: {
    color: "#5A1848",
    marginBottom: 15,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 15,
  },

  card: {
    borderRadius: 20,
    padding: 20,
    textAlign: "center",
    cursor: "pointer",
    transition: ".3s",
  },

  icon: {
    fontSize: 38,
    marginBottom: 10,
  },

  cardText: {
    margin: 0,
    fontWeight: "bold",
    color: "#5A1848",
  },
};