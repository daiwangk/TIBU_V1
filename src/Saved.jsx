import { useState } from "react";
import ProductCard from "./Components/ProductCard";
import BusinessCard from "./Components/BusinessCard";
import ReelCard from "./Components/ReelCard";


export default function Saved({
  setPage,
  setSelectedProduct,
  setSelectedBusiness,
  setSelectedReel,
  setCurrentReels,
  setPreviousPage,

  savedProducts,
  setSavedProducts,

  savedBusinesses,
  setSavedBusinesses,

  savedReels,
  setSavedReels,
}){
    const [activeTab, setActiveTab] = useState("products");

  

    console.log("Saved Products:", savedProducts);
    
  return (
    <div style={{padding:40}}>
      <h1
style={{
marginTop:0,
marginBottom:"8px",
fontSize:"32px",
color:"#35142E"
}}
>
❤️ Saved
</h1>
<p
style={{
color:"#777",
marginBottom:"35px"
}}
>
Your favourite businesses and products.
</p>

<p
style={{
color:"#777",
marginBottom:"30px"
}}
>
12 Products • 5 Businesses • 8 Reels
</p>
<div
style={{
display:"flex",
background:"#F6F1F4",
padding:"6px",
borderRadius:"18px",
marginBottom:"30px"
}}
>

<div
onClick={()=>setActiveTab("products")}
style={{
flex:1,
padding:"12px",
textAlign:"center",
borderRadius:"14px",
cursor:"pointer",
background:activeTab==="products" ? "#5A1848":"transparent",
color:activeTab==="products" ? "white":"#666",
fontWeight:"600"
}}
>
❤️ Products
</div>

<div
onClick={()=>setActiveTab("businesses")}
style={{
flex:1,
padding:"12px",
textAlign:"center",
borderRadius:"14px",
cursor:"pointer",
background:activeTab==="businesses" ? "#5A1848":"transparent",
color:activeTab==="businesses" ? "white":"#666",
fontWeight:"600"
}}
>
🏪 Businesses
</div>

<div
onClick={()=>setActiveTab("reels")}
style={{
flex:1,
padding:"12px",
textAlign:"center",
borderRadius:"14px",
cursor:"pointer",
background:activeTab==="reels" ? "#5A1848":"transparent",
color:activeTab==="reels" ? "white":"#666",
fontWeight:"600"
}}
>
🎥 Reels
</div>

</div>
{activeTab === "products" && (

<>
<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
marginBottom:"20px"
}}
>

<h2
style={{
margin:0,
color:"#35142E"
}}
>
Saved Products
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
gap:"20px"
}}
>
{savedProducts.map((product,index) => (
<ProductCard
  key={index}
  product={product}
  name={product.name}
  seller={product.seller}
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
    setPreviousPage("saved");
    setPage("product");
  }}
/>
))}
</div>

</>

)}
{activeTab === "businesses" && (

<>

<h2
style={{
margin:0,
marginBottom:"20px",
color:"#35142E"
}}
>
Saved Businesses
</h2>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: "20px",
  }}
>
  {savedBusinesses.map((business, index) => (
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
        setPreviousPage("saved");
        setPage("business");
      }}
    />
  ))}
</div>

</>

)}
{activeTab === "reels" && (
  <>
    <h2
      style={{
        margin: 0,
        marginBottom: "20px",
        color: "#35142E",
      }}
    >
      Saved Reels
    </h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2,1fr)",
        gap: "20px",
      }}
    >
      {savedReels.map((reel, index) => (
        <ReelCard
          key={index}
          reel={reel}
          caption={reel.caption}
          emoji={reel.emoji}

          savedReels={savedReels}
          setSavedReels={setSavedReels}

          onClick={() => {
            setSelectedReel(reel);
            setCurrentReels(savedReels);
            setPreviousPage("saved");
            setPage("reel");
          }}
        />
      ))}
    </div>
  </>
)}
    </div>
  );
}