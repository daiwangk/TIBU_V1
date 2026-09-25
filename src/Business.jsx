import { useState } from "react";
import ReelCard from "./Components/ReelCard";
import ProductCard from "./Components/ProductCard";
export default function Business({
  setPage,
  selectedBusiness,
  setSelectedReel,
  setCurrentReels,
  previousPage,

  setSelectedProduct,
  setPreviousPage,

  savedProducts,
  setSavedProducts,

  savedReels,
setSavedReels,

savedBusinesses,
setSavedBusinesses,
}) {
  const [activeTab, setActiveTab] = useState("products");

  console.log(selectedBusiness);
  if (!selectedBusiness) {
  return (
    <div style={{ padding: "30px" }}>
      <button
        onClick={() => setPage(previousPage)}
      >
        ← Back
      </button>

      <p>No business selected.</p>
    </div>
  );
}
  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#FFF8EF",
      padding: "20px",
      paddingBottom: "110px",
      fontFamily: "Arial, sans-serif",
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
  onClick={() =>
    setPage(selectedBusiness.previousPage || previousPage)
  }
  style={{
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "16px",
    color: "#5A1848",
    fontWeight: "600",
    padding: 0,
    marginBottom: "20px",
  }}
>
  ← Back
</button>
    </div>

    {/* Cover */}
<div
style={{
height:"200px",
borderRadius:"24px",
background:"linear-gradient(135deg,#8E4D6D,#EAB38E)",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"90px",
overflow:"hidden"
}}
>
{selectedBusiness.businessEmoji}
</div>
{/* Business Logo */}

<div
style={{
display:"flex",
justifyContent:"center",
marginTop:"-45px"
}}
>

<div
style={{
width:"90px",
height:"90px",
borderRadius:"50%",
background:"#FFF",
border:"4px solid white",
boxShadow:"0 8px 20px rgba(0,0,0,.12)",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"42px"
}}
>
{selectedBusiness.businessEmoji}
</div>

</div>
{/* Business Details */}

<div
style={{
textAlign:"center",
marginTop:"18px"
}}
>

<h1
style={{
margin:0,
color:"#35142E",
fontSize:"30px"
}}
>
{selectedBusiness.businessName}
</h1>

<div
style={{
display:"inline-block",
marginTop:"12px",
padding:"7px 16px",
background:"#FFE8F1",
color:"#C23D71",
borderRadius:"30px",
fontWeight:"600",
fontSize:"14px"
}}
>
{selectedBusiness.category}
</div>

<p
style={{
marginTop:"16px",
marginBottom:"6px",
color:"#555",
fontSize:"16px"
}}
>
⭐ {selectedBusiness.rating} ({selectedBusiness.businessReviews})
</p>

<p
style={{
margin:0,
color:"#888",
fontSize:"15px"
}}
>
📍 {selectedBusiness.location}
</p>

</div>
{/* ================= ABOUT ================= */}

<div
style={{
background:"white",
marginTop:"30px",
padding:"22px",
borderRadius:"20px",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<h2
style={{
margin:0,
color:"#35142E",
fontSize:"22px"
}}
>
About
</h2>

<button
style={{
border:"none",
background:"none",
color:"#5A1848",
fontWeight:"600",
cursor:"pointer",
textDecoration:"underline"
}}
>
Read More
</button>

</div>

<p
style={{
marginTop:"16px",
lineHeight:"28px",
color:"#666",
fontSize:"16px"
}}
>
{selectedBusiness.about}
</p>

</div>
{/* ================= BUSINESS ACTION BUTTONS ================= */}

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "22px",
  }}
>

  {/* Save Business */}

  <button
    onClick={() => {
      const alreadySaved = savedBusinesses.some(
        (item) => item.businessName === selectedBusiness.businessName
      );

      if (alreadySaved) {
        setSavedBusinesses(
          savedBusinesses.filter(
            (item) => item.businessName !== selectedBusiness.businessName
          )
        );
      } else {
        setSavedBusinesses([
          ...savedBusinesses,
          selectedBusiness
        ]);
      }
    }}
    style={{
      width: "52px",
      height: "52px",
      border: "none",
      borderRadius: "14px",
      background: "#F4EEF2",
      fontSize: "22px",
      cursor: "pointer",
      flexShrink: 0,
    }}
  >
    {savedBusinesses.some(
      (item) => item.businessName === selectedBusiness.businessName
    )
      ? "❤️"
      : "🤍"}
  </button>


  {/* WhatsApp */}

  <button
    onClick={() => {
      const phone = selectedBusiness.businessPhone || "";

      if (!phone) {
        alert("WhatsApp number is not available.");
        return;
      }

      window.open(
        `https://wa.me/${phone.replace(/\D/g, "")}`,
        "_blank"
      );
    }}
    style={{
      flex: 1,
      padding: "14px 10px",
      border: "none",
      borderRadius: "14px",
      background: "#25D366",
      color: "white",
      fontWeight: "700",
      fontSize: "15px",
      cursor: "pointer",
    }}
  >
    💬 WhatsApp
  </button>


  {/* Call */}

  <button
    onClick={() => {
      const phone = selectedBusiness.businessPhone || "";

      if (!phone) {
        alert("Phone number is not available.");
        return;
      }

      window.location.href = `tel:${phone}`;
    }}
    style={{
      flex: 1,
      padding: "14px 10px",
      border: "none",
      borderRadius: "14px",
      background: "#F7D9DF",
      color: "#C94258",
      fontWeight: "700",
      fontSize: "15px",
      cursor: "pointer",
    }}
  >
    📞 Call
  </button>

</div>
{/* ================= BUSINESS INFO ================= */}

<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"16px",
marginTop:"28px"
}}
>

<div
style={{
background:"white",
borderRadius:"18px",
padding:"18px",
textAlign:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<div style={{fontSize:"34px"}}>🚚</div>

<p
style={{
marginTop:"12px",
marginBottom:"4px",
fontWeight:"700",
color:"#35142E"
}}
>
Delivery
</p>

<p
style={{
margin:0,
fontSize:"14px",
color:"#777"
}}
>
{selectedBusiness.delivery}
</p>

</div>

<div
style={{
background:"white",
borderRadius:"18px",
padding:"18px",
textAlign:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<div style={{fontSize:"34px"}}>🏪</div>

<p
style={{
marginTop:"12px",
marginBottom:"4px",
fontWeight:"700",
color:"#35142E"
}}
>
Pickup
</p>

<p
style={{
margin:0,
fontSize:"14px",
color:"#777"
}}
>
{selectedBusiness.pickup}
</p>

</div>

</div>

<div
style={{
background:"white",
borderRadius:"18px",
padding:"18px",
marginTop:"16px",
display:"flex",
justifyContent:"center",
alignItems:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>
<div
style={{
display:"flex",
alignItems:"center",
gap:"14px"
}}
>

<div
style={{
fontSize:"30px"
}}
>
📍
</div>

<div
style={{
textAlign:"left"
}}
>

<p
style={{
margin:0,
fontWeight:"700",
color:"#35142E"
}}
>
Location
</p>

<p
style={{
marginTop:"6px",
color:"#777"
}}
>
{selectedBusiness.location}
</p>

</div>

</div>


</div>
{/* ================= QUICK INFO ================= */}

<div
style={{
display:"flex",
justifyContent:"space-between",
gap:"12px",
marginTop:"30px",
marginBottom:"30px"
}}
>

<div
style={{
flex:1,
background:"white",
padding:"16px",
borderRadius:"18px",
textAlign:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<h2
style={{
margin:0,
color:"#5A1848"
}}
>
{selectedBusiness.products.length}
</h2>

<p
style={{
marginTop:"8px",
marginBottom:0,
fontSize:"14px",
color:"#777"
}}
>
Products
</p>

</div>

<div
style={{
flex:1,
background:"white",
padding:"16px",
borderRadius:"18px",
textAlign:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<h2
style={{
margin:0,
color:"#5A1848"
}}
>
8
</h2>

<p
style={{
marginTop:"8px",
marginBottom:0,
fontSize:"14px",
color:"#777"
}}
>
Reels
</p>

</div>

<div
style={{
flex:1,
background:"white",
padding:"16px",
borderRadius:"18px",
textAlign:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<h2
style={{
margin:0,
color:"#5A1848"
}}
>
{selectedBusiness.businessReviews}
</h2>

<p
style={{
marginTop:"8px",
marginBottom:0,
fontSize:"14px",
color:"#777"
}}
>
Reviews
</p>

</div>

</div>
{/* ================= TABS ================= */}

<div
style={{
display:"flex",
justifyContent:"space-between",
marginTop:"35px",
background:"white",
borderRadius:"18px",
padding:"6px",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<div
onClick={() => setActiveTab("products")}
style={{
flex:1,
background: activeTab==="products" ? "#5A1848" : "transparent",
color: activeTab==="products" ? "white" : "#666",
padding:"12px",
textAlign:"center",
borderRadius:"14px",
fontWeight:"600",
cursor:"pointer"
}}
>
Products
</div>

<div
onClick={() => setActiveTab("discover")}
style={{
flex:1,
background: activeTab==="discover" ? "#5A1848" : "transparent",
color: activeTab==="discover" ? "white" : "#666",
padding:"12px",
textAlign:"center",
borderRadius:"14px",
fontWeight:"600",
cursor:"pointer"
}}
>
Discover
</div>

<div
onClick={() => setActiveTab("reviews")}
style={{
flex:1,
background: activeTab==="reviews" ? "#5A1848" : "transparent",
color: activeTab==="reviews" ? "white" : "#666",
padding:"12px",
textAlign:"center",
borderRadius:"14px",
fontWeight:"600",
cursor:"pointer"
}}
>
Reviews
</div>

</div>
{activeTab === "products" && (
<>

{/* ================= PRODUCTS ================= */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:"35px",
marginBottom:"20px"
}}
>

<h2
style={{
margin:0,
color:"#35142E"
}}
>
Products
</h2>

<button
style={{
border:"none",
background:"none",
color:"#5A1848",
fontWeight:"600",
cursor:"pointer",
textDecoration:"underline"
}}
>
View All →
</button>

</div>
<div
style={{
display:"grid",
gridTemplateColumns:"repeat(2,1fr)",
gap:"18px"
}}
>
  {selectedBusiness.products.map((product, index) => (
  <ProductCard
    key={index}
    product={product}
    name={product.name}
    seller={product.businessName}
    price={product.price}
    rating={product.rating}
    distance={product.distance}
    emoji={product.emoji}
    color1={product.color1}
    color2={product.color2}

    savedProducts={savedProducts}
    setSavedProducts={setSavedProducts}

    onViewProduct={() => {
      setSelectedProduct(product);
      setPreviousPage("business");
      setPage("product");
    }}
  />
))}
</div>
</>

)}
{activeTab === "discover" && (

<>

{/* ================= DISCOVER ================= */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:"40px",
marginBottom:"20px"
}}
>

<h2
style={{
margin:0,
color:"#35142E"
}}
>
Discover
</h2>

<button
style={{
border:"none",
background:"none",
color:"#5A1848",
fontWeight:"600",
cursor:"pointer",
textDecoration:"underline"
}}
>
View All →
</button>

</div>
<div
  style={{
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    overflowY: "hidden",
    paddingBottom: "10px",
    paddingLeft: "2px",
    paddingRight: "2px",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitOverflowScrolling: "touch",
  }}
>

{selectedBusiness.reels.map((reel, index) => (
  <ReelCard
  key={index}
  reel={reel}
  business={reel.business}
  caption={reel.caption}
  emoji={reel.emoji}

  savedReels={savedReels}
  setSavedReels={setSavedReels}

  onClick={() => {
    setCurrentReels(selectedBusiness.reels);
    setSelectedReel(reel);
    setPage("reel");
  }}
/>
))}
</div>

</>

)}

{activeTab === "reviews" && (


<>
{/* ================= REVIEWS ================= */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginTop:"40px",
marginBottom:"20px"
}}
>

<h2
style={{
margin:0,
color:"#35142E"
}}
>
Reviews
</h2>

<button
style={{
border:"none",
background:"none",
color:"#5A1848",
fontWeight:"600",
cursor:"pointer",
textDecoration:"underline"
}}
>
View All →
</button>

</div>


<div
style={{
background:"white",
padding:"24px",
borderRadius:"20px",
boxShadow:"0 8px 18px rgba(0,0,0,.06)"
}}
>

<h2
style={{
margin:0,
color:"#35142E"
}}
>
⭐ {selectedBusiness.rating}
</h2>

<p
style={{
marginTop:"8px",
color:"#777"
}}
>
Based on {selectedBusiness.businessReviews} customer reviews
</p>

<hr style={{margin:"20px 0",border:"1px solid #eee"}} />

<div style={{marginBottom:"10px"}}>★★★★★ (260)</div>
<div style={{marginBottom:"10px"}}>★★★★☆ (45)</div>
<div style={{marginBottom:"10px"}}>★★★☆☆ (10)</div>
<div style={{marginBottom:"10px"}}>★★☆☆☆ (3)</div>
<div>★☆☆☆☆ (2)</div>

</div>

<div
style={{
display:"flex",
flexDirection:"column",
gap:"18px",
marginTop:"24px"
}}
>

{selectedBusiness.reviews.map((review, index) => (

<div
key={index}
style={{
background:"white",
padding:"20px",
borderRadius:"18px",
boxShadow:"0 8px 18px rgba(0,0,0,.06)"
}}
>

<h3
style={{
margin:"0 0 8px",
color:"#35142E"
}}
>
{review.name}
</h3>

<p style={{margin:"0 0 10px"}}>
{review.rating}
</p>

<p
style={{
margin:0,
lineHeight:"26px",
color:"#666"
}}
>
{review.review}
</p>

</div>

))}

</div>

</>

)}


</div>
);
}