/* eslint-disable */
import { useState, useEffect } from "react";


export default function SearchBar({
  placeholder = "Search...",
  onSearch,
  onSubmit,
  initialValue = "",
  onApplyFilters,
  hideCategoryFilter = false,
}) {
  const [search, setSearch] = useState(initialValue);
  useEffect(() => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  setSearch(initialValue);
}, [initialValue]);
  const [showFilters, setShowFilters] = useState(false);
const [selectedCategory, setSelectedCategory] = useState("All");
const [selectedDistance, setSelectedDistance] = useState("Anywhere");
const [selectedPrice, setSelectedPrice] = useState("All");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "28px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "white",
          padding: "16px 18px",
          borderRadius: "22px",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}
      >
        <span>🔍</span>

        <input
          type="text"
          value={search}
          placeholder={placeholder}
     onChange={(e) => {
  const value = e.target.value;
  setSearch(value);
  onSearch?.(value);
}}
          onKeyDown={(e) => {
  if (e.key === "Enter") {
    onSubmit?.(search);
  }
}}
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            fontSize: "15px",
          }}
        />
      </div>

      <button
  onClick={() => setShowFilters(true)}
  style={{
    width: "56px",
    height: "56px",
    border: "none",
    borderRadius: "18px",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
    cursor: "pointer",
    fontSize: "24px",
    position: "relative",
  }}
>
  ☷

  {(selectedCategory !== "All" ||
    selectedDistance !== "Anywhere" ||
    selectedPrice !== "All") && (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: "#5A1848",
      }}
    />
  )}
</button>

{showFilters && (
  <div
    onClick={() => setShowFilters(false)}
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,.35)",
      display: "flex",
      justifyContent: "center",
      alignItems:"flex-start",
      paddingTop:"40px",
      paddingBottom:"100px",
      overflowY:"auto",
      zIndex: 999,
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width: "390px",
        maxWidth: "92%",
        maxHeight:"78vh",
        paddingBottom:"30px",
        overflowY: "auto",
        background: "white",
        borderRadius: "26px",
        padding: "28px",
        boxShadow: "0 20px 50px rgba(0,0,0,.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#35142E",
          }}
        >
          Filters
        </h2>

        <button
          onClick={() => setShowFilters(false)}
          style={{
            border: "none",
            background: "#F5F5F5",
            width: "38px",
            height: "38px",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          ✕
        </button>
      </div>

      {!hideCategoryFilter && (
  <>
    {/* CATEGORY */}

    <h3 style={{ margin: "0 0 14px", color: "#35142E" }}>
      📂 Category
    </h3>

    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        marginBottom: "28px",
      }}
    >
      {[
        "All",
        "Desserts",
        "Handmade",
        "Fashion",
        "Jewellery",
        "Crochet",
        "Gifts",
      ].map((item) => (
        <div
          key={item}
          onClick={() => setSelectedCategory(item)}
          style={{
            padding: "10px 18px",
            borderRadius: "30px",
            background:
              selectedCategory === item ? "#5A1848" : "#F6F1F4",
            color:
              selectedCategory === item ? "white" : "#5A1848",
            border:
              selectedCategory === item
                ? "1px solid #5A1848"
                : "1px solid #E7DEE5",
            cursor: "pointer",
            fontWeight: "500",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  </>
)}

      {/* DISTANCE */}

      <h3 style={{ margin: "0 0 14px", color: "#35142E" }}>
        📍 Distance
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "28px",
        }}
      >
        {[
          "Within 2 km",
          "Within 5 km",
          "Within 10 km",
          "Within 15 km",
          "Anywhere",
        ].map((item) => (
          <div
            key={item}
            onClick={() => setSelectedDistance(item)}
            style={{
              padding: "10px 18px",
              borderRadius: "30px",
              background:
                selectedDistance === item ? "#5A1848" : "#F6F1F4",
              color:
                selectedDistance === item ? "white" : "#5A1848",
              border:
                selectedDistance === item
                  ? "1px solid #5A1848"
                  : "1px solid #E7DEE5",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* PRICE */}

      <h3 style={{ margin: "0 0 14px", color: "#35142E" }}>
        💰 Price
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "34px",
        }}
      >
        {[
          "All",
          "Under ₹250",
          "₹250–500",
          "₹500–1000",
          "₹1000+",
        ].map((item) => (
          <div
            key={item}
            onClick={() => setSelectedPrice(item)}
            style={{
              padding: "10px 18px",
              borderRadius: "30px",
              background:
                selectedPrice === item ? "#5A1848" : "#F6F1F4",
              color:
                selectedPrice === item ? "white" : "#5A1848",
              border:
                selectedPrice === item
                  ? "1px solid #5A1848"
                  : "1px solid #E7DEE5",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
  onApplyFilters?.({
    category: selectedCategory,
    distance: selectedDistance,
    price: selectedPrice,
  });

  setShowFilters(false);
}}
        style={{
          width: "100%",
          padding: "16px",
          border: "none",
          borderRadius: "18px",
          background: "#5A1848",
          color: "white",
          fontWeight: "700",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Apply Filters
      </button>
    </div>
  </div>
)}

</div>
  );
}