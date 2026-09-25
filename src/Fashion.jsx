/* eslint-disable */
import { useState } from "react";
import { useAsync } from "./hooks/useAsync";
import { listProducts } from "./services/productService";
import Banner from "./Components/Banner";
import SearchBar from "./Components/SearchBar";
import ProductCard from "./Components/ProductCard";

export default function Fashion({

  setPage,
  setSelectedProduct,
  setSelectedBusiness,

  savedProducts,
  setSavedProducts,
}) {
const [searchText, setSearchText] = useState("");

const [filters, setFilters] = useState({
  distance: "Anywhere",
  price: "All",
});

const filteredFashionProducts = fashionProducts.filter((shop) => {
  const matchesSearch = shop.name
    .toLowerCase()
    .includes(searchText.toLowerCase());

  const matchesDistance =
    filters.distance === "Anywhere" ||
    shop.distance === filters.distance;

  const matchesPrice =
    filters.price === "All" ||
    (filters.price === "Under ₹500" && shop.price < 500) ||
    (filters.price === "₹500–₹1000" &&
      shop.price >= 500 &&
      shop.price <= 1000) ||
    (filters.price === "Above ₹1000" && shop.price > 1000);

  return matchesSearch && matchesDistance && matchesPrice;
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
      
<div
  style={{
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "18px",
  }}
>
  <button
    onClick={() => setPage("home")}
    style={{
      border: "none",
      background: "none",
      padding: 0,
      cursor: "pointer",
      fontSize: "16px",
      color: "#5A1848",
      fontWeight: "600",
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
  placeholder="Search kurtis, shirts..."
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
  ].map((item) => (
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
    title="Latest Fashion Trends 👗"
    subtitle="Women's • Men's • Handmade Clothing"
    emoji="✨"
    color1="#8E4D6D"
    color2="#F7BFA5"
  />
<h2
  style={{
    marginTop: "36px",
    marginBottom: "18px",
    color: "#35142E",
  }}
>
  ✨ Explore Fashion
</h2>
  <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "16px",
  }}
>
  {[
    {
      emoji: "👗",
      title: "Women's Fashion",
      subtitle: "Kurtis • Dresses • Tops",
      page: "womenfashion",
    },
    {
      emoji: "👔",
      title: "Men's Fashion",
      subtitle: "Shirts • T-Shirts • Jeans",
      page: "menfashion",
    },
  ].map((item, index) => (
    <div
      key={index}
      onClick={() => setPage(item.page)}
      style={{
        background: "white",
        borderRadius: "22px",
        padding: "22px",
        boxShadow: "0 8px 18px rgba(0,0,0,.06)",
        cursor: "pointer",
        transition: ".25s",
      }}
    >
      <div
        style={{
          fontSize: "42px",
        }}
      >
        {item.emoji}
      </div>

      <h3
        style={{
          marginTop: "16px",
          marginBottom: "8px",
          color: "#35142E",
          fontSize: "18px",
        }}
      >
        {item.title}
      </h3>

      <p
        style={{
          margin: 0,
          color: "#777",
          fontSize: "13px",
          lineHeight: "20px",
        }}
      >
        {item.subtitle}
      </p>
    </div>
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
  {filteredFashionProducts.length} result
  {filteredFashionProducts.length !== 1 ? "s" : ""} found
</p>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: "18px",
    }}
  >
    {filteredFashionProducts.map((shop, index) => (
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

  {filteredFashionProducts.length === 0 && (
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
</>

)}
    </div>
  );
}