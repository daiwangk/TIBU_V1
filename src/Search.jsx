import { listProducts } from "./services/productService";
import { useAsync } from "./hooks/useAsync";
import { useState } from "react";
import SearchBar from "./Components/SearchBar";
import ProductCard from "./Components/ProductCard";
export default function Search({
  setPage,
  searchText,
  setSearchText,
  setSelectedProduct,
  filters,
  setFilters,
  setPreviousPage,

  savedProducts,
  setSavedProducts,
}) {
  const { data: dessertsProducts = [], loading: load_dessertsProducts } = useAsync(() => listProducts('desserts'));
  const { data: fashionProducts = [], loading: load_fashionProducts } = useAsync(() => listProducts('fahion'));
  const { data: giftsProducts = [], loading: load_giftsProducts } = useAsync(() => listProducts('gifts'));
  const { data: handmadeProducts = [], loading: load_handmadeProducts } = useAsync(() => listProducts('handmade'));
  const { data: jewelleryProducts = [], loading: load_jewelleryProducts } = useAsync(() => listProducts('jewellery'));
  const [recent, setRecent] = useState([


 
  "Brownies",
  "Crochet Bags",
  "Birthday Cakes",
  "Handmade Gifts",
]);

  if (load_dessertsProducts || load_fashionProducts || load_giftsProducts || load_handmadeProducts || load_jewelleryProducts) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;


  const trending = [
  "Cheesecake",
  "Resin Art",
  "Flower Bouquet",
  "Jewellery",
  "Candles",
  "Macarons",
];

  const categories = [
  { label: "🍰 Desserts", page: "desserts" },
  { label: "👗 Fashion", page: "fashion" },
  { label: "🎨 Handmade", page: "handmade" },
  { label: "💍 Jewellery", page: "jewellery" },
  { label: "🎁 Gifts", page: "gifts" },
  { label: "🧶 Crochet", page: "crochet" },
];
  
const allProducts = [
  ...dessertsProducts,
  ...fashionProducts,
  ...handmadeProducts,
  ...jewelleryProducts,
  ...giftsProducts,
];
const filteredResults = allProducts.filter((item) => {
  // Search
const matchesSearch =
searchText.trim() === "" ||
(item.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
(item.seller || "").toLowerCase().includes(searchText.toLowerCase());
  // Category
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

  // Convert "₹199" -> 199
  const price = item.price;

  // Price
  let matchesPrice = true;

  if (filters.price === "Under ₹250")
    matchesPrice = price < 250;

  else if (filters.price === "₹250–500")
    matchesPrice = price >= 250 && price <= 500;

  else if (filters.price === "₹500–1000")
    matchesPrice = price >= 500 && price <= 1000;

  else if (filters.price === "₹1000+")
    matchesPrice = price > 1000;

  // Convert distance
  let distance = 2.5;

  // Distance
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


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF8EF",
        padding: "40px",
        paddingBottom: "120px",
        fontFamily: "Arial",
      }}
    >
    <h1
style={{
marginTop:0,
marginBottom:"8px",
fontSize:"32px",
color:"#35142E"
}}
>
🔍 Search
</h1>

<p
style={{
color:"#777",
marginBottom:"35px"
}}
>
Find products and local businesses.
</p>

    {/* SEARCH */}

<SearchBar
  placeholder="Search brownies, crochet, jewellery..."
  initialValue={searchText}
  onSearch={(value) => {
    setSearchText(value);
  }}
  onSubmit={(value) => {
    const text = value.trim();

    if (!text) return;

    setRecent((prev) => {
      const updated = [
        text,
        ...prev.filter(
          (item) =>
            item.toLowerCase() !== text.toLowerCase()
        ),
      ];

      return updated.slice(0, 5);
    });
  }}

  onApplyFilters={(newFilters) => {
  setFilters(newFilters);
}}
/>
{(searchText ||
  filters.category !== "All" ||
  filters.distance !== "Anywhere" ||
  filters.price !== "All") && (
  <>
    <h3
  style={{
    marginTop: "30px",
    color: "#35142E",
  }}
>
  Results
</h3>

    {filteredResults.length > 0 ? (
      filteredResults.map((item, index) => (
  <div
    key={index}
    style={{
      marginTop: "20px",
    }}
  >
   <ProductCard
  product={item}
  name={item.name}
  seller={item.seller}
  price={item.price}
  rating={item.rating}
  distance={item.distance}
  emoji={item.emoji}
  color1={item.color1}
  color2={item.color2}

  savedProducts={savedProducts}
  setSavedProducts={setSavedProducts}

  onViewProduct={() => {
    setSelectedProduct(item);
    setPreviousPage("search");
    setPage("product");
  }}
/>
  </div>
))
    ) : (
      <p style={{ color: "#777", marginTop: "18px" }}>
        No results found.
      </p>
    )}
  </>
)}
{!searchText && (
  <>

      {/* Recent */}

      <h3
  style={{
    marginTop: "35px",
    color: "#35142E",
    textAlign: "left",
    width: "100%",
  }}
>
        🕒 Recent Searches
      </h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {recent.map((item) => (
          <div
  key={item}
  onClick={() => setSearchText(item)}
  style={{
    background: "white",
    padding: "10px 18px",
    borderRadius: "30px",
    boxShadow: "0 3px 10px rgba(0,0,0,.05)",
    cursor: "pointer",
  }}
>
  {item}
</div>
        ))}
      </div>

      {/* Trending */}

     <h3
  style={{
    marginTop: "35px",
    color: "#35142E",
    textAlign: "left",
    width: "100%",
  }}
>
🔥 Trending Searches
</h3>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        {trending.map((item) => (
  <div
    key={item}
    onClick={() => {
      setSearchText(item);

      setRecent((prev) => {
        const updated = [
          item,
          ...prev.filter(
            (search) =>
              search.toLowerCase() !== item.toLowerCase()
          ),
        ];

        return updated.slice(0, 5);
      });
    }}
    style={{
      background: "#F9E9F1",
      padding: "10px 18px",
      borderRadius: "30px",
      color: "#5A1848",
      fontWeight: "600",
      cursor: "pointer",
    }}
  >
    {item}
  </div>
))}
      </div>

      {/* Categories */}

      <h3
  style={{
    marginTop: "35px",
    color: "#35142E",
    textAlign: "left",
    width: "100%",
  }}
>
📂 Categories
</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "15px",
        }}
      >
        {categories.map((item) => (
  <div
    key={item.page}
    onClick={() => setPage(item.page)}
    style={{
      background: "white",
      padding: "20px",
      borderRadius: "18px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,.07)",
      fontWeight: "600",
      cursor: "pointer",
      transition: "0.2s",
    }}
  >
    {item.label}
  </div>
))}
      </div>   
        </>
)}
    </div>
  );
}