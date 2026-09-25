import { listBusinesses } from "./services/businessService";
import { useAsync } from "./hooks/useAsync";

export default function Product({
  setPage,
  selectedProduct,
  setSelectedBusiness,
  previousPage,
  savedProducts,
  setSavedProducts,
}) {
  const { data: candleBusinesses = [], loading: load_candleBusinesses } = useAsync(() => listBusinesses('candle'));
  const { data: crochetBusinesses = [], loading: load_crochetBusinesses } = useAsync(() => listBusinesses('crochet'));
  const { data: dessertBusinesses = [], loading: load_dessertBusinesses } = useAsync(() => listBusinesses('desert'));
  const { data: embroideryBusinesses = [], loading: load_embroideryBusinesses } = useAsync(() => listBusinesses('embroidery'));
  const { data: giftsBusinesses = [], loading: load_giftsBusinesses } = useAsync(() => listBusinesses('gifts'));
  const { data: jewelleryBusinesses = [], loading: load_jewelleryBusinesses } = useAsync(() => listBusinesses('jewellery'));
  const { data: menFashionBusinesses = [], loading: load_menFashionBusinesses } = useAsync(() => listBusinesses('men-fashion'));
  const { data: resinBusinesses = [], loading: load_resinBusinesses } = useAsync(() => listBusinesses('rein'));
  const { data: womenFashionBusinesses = [], loading: load_womenFashionBusinesses } = useAsync(() => listBusinesses('women-fashion'));
  if (load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_giftsBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;


  if (!selectedProduct) {
    return (
      <div style={{ padding: "30px" }}>
        <button onClick={() => {
  setPage(previousPage || "home");
}}>
          ← Back
        </button>
      </div>
    );
  }
  return (

<div
style={{
background:"#FFF8EF",
minHeight:"100vh",
padding:"20px",
paddingBottom:"140px",
fontFamily:"Arial"
}}
>

{/* Header */}

<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
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

{/* Product Image */}

<div
style={{
height:"320px",
background:"#F7C7A5",
borderRadius:"24px",
marginTop:"18px",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"120px"
}}
>
{selectedProduct.emoji}
</div>
<h1
  style={{
    marginTop: "20px",
    marginBottom: "8px",
    color: "#35142E",
    fontSize: "26px",
    lineHeight: "32px",
  }}
>
  {selectedProduct.name}
</h1>

<p
style={{
marginTop:"15px",
marginBottom:"15px",
fontSize:"15px",
color:"#777"
}}
>
by {selectedProduct.businessName}
</p>

<p
style={{
marginTop:0,
marginBottom:"16px",
color:"#777"
}}
>
⭐ {selectedProduct.rating} • 📍 {selectedProduct.distance}
</p>

<h2
style={{
  marginTop: 0,
  marginBottom: "28px",
  color: "#5A1848",
  fontSize: "22px",
  lineHeight: "28px",
}}
>
{selectedProduct.price}
</h2>
{/* About */}

<h3
style={{
  marginTop: "30px",
  marginBottom: "12px",
  color: "#35142E",
  fontSize: "20px",
  lineHeight: "26px",
}}
>
About
</h3>

<p
style={{
  lineHeight: "25px",
  color: "#666",
  fontSize: "15px",
  margin: 0
}}
>
{selectedProduct.about}
</p>


{/* Variants */}

<h3
style={{
marginTop:"35px",
color:"#35142E"
}}
>
Choose Variant
</h3>

<div
style={{
display:"flex",
gap:"12px",
marginTop:"15px",
flexWrap:"wrap"
}}
>

<button
style={{
padding:"10px 16px",
borderRadius:"30px",
border:"2px solid #5A1848",
background:"#5A1848",
color:"white",
fontSize:"14px",
fontWeight:"600",
cursor:"pointer"
}}
>
Box of 4
</button>

<button
style={{
padding:"10px 16px",
borderRadius:"30px",
border:"2px solid #ddd",
background:"white",
cursor:"pointer"
}}
>
Box of 6
</button>

<button
style={{
padding:"10px 16px",
borderRadius:"30px",
border:"2px solid #ddd",
background:"white",
cursor:"pointer"
}}
>
Box of 12
</button>

</div>

{/* Delivery */}

<div
style={{
background:"white",
borderRadius:"18px",
padding:"18px",
marginTop:"25px",
boxShadow:"0 6px 18px rgba(0,0,0,.06)"
}}
>

<p style={{margin:"0 0 14px",fontWeight:"600"}}>
🚚 {selectedProduct.delivery}
</p>

<p style={{margin:"0 0 14px",fontWeight:"600"}}>
🏪 {selectedProduct.pickup}
</p>

<p style={{margin:0,fontWeight:"600"}}>
📍 {selectedProduct.location}
</p>

</div>
{/* ================= PRODUCT ACTION BUTTONS ================= */}

<div
  style={{
    display: "flex",
    gap: "10px",
    marginTop: "22px",
    marginBottom: "20px",
  }}
>

  {/* Save Product */}

  <button
    onClick={() => {
      const alreadySaved = savedProducts.some(
        (item) => item.name === selectedProduct.name
      );

      if (alreadySaved) {
        setSavedProducts(
          savedProducts.filter(
            (item) => item.name !== selectedProduct.name
          )
        );
      } else {
        setSavedProducts([
          ...savedProducts,
          selectedProduct
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
    {savedProducts.some(
      (item) => item.name === selectedProduct.name
    )
      ? "❤️"
      : "🤍"}
  </button>


  {/* WhatsApp */}

  <button
    onClick={() => {
      const phone = selectedProduct.businessPhone;

      if (!phone) {
        alert("Seller WhatsApp number is not available.");
        return;
      }

      window.open(
        `https://wa.me/${phone.replace(/\D/g, "")}`,
        "_blank"
      );
    }}
    style={{
      flex: 1,
      height: "52px",
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
      const phone = selectedProduct.businessPhone;

      if (!phone) {
        alert("Seller phone number is not available.");
        return;
      }

      window.location.href = `tel:${phone}`;
    }}
    style={{
      flex: 1,
      height: "52px",
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
{/* Business */}

<h3
style={{
  margin: 0,
  color: "#35142E",
  fontSize: "18px",
  lineHeight: "23px",
}}
></h3>

<div
style={{
background:"white",
borderRadius:"20px",
padding:"18px",
marginTop:"15px",
display:"flex",
justifyContent:"space-between",
alignItems:"center",
boxShadow:"0 8px 20px rgba(0,0,0,.06)"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:"15px"
}}
>

<div
style={{
width:"65px",
height:"65px",
borderRadius:"50%",
background:"#FFE4D6",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"34px"
}}
>
{selectedProduct.businessEmoji}
</div>

<div>

<h3
style={{
margin:0,
color:"#35142E"
}}
>
{selectedProduct.businessName}
</h3>

<p
style={{
margin:"6px 0",
color:"#777"
}}
>
⭐ {selectedProduct.rating} • {selectedProduct.businessReviews}
</p>

<p
style={{
margin:0,
fontSize:"14px",
color:"#999"
}}
>
📍 {selectedProduct.location}
</p>

</div>

</div>

<button
onClick={() => {

 const allBusinesses = [
  ...dessertBusinesses,
  ...crochetBusinesses,
  ...embroideryBusinesses,
  ...candleBusinesses,
  ...resinBusinesses,
  ...jewelleryBusinesses,
  ...giftsBusinesses,
  ...menFashionBusinesses,
  ...womenFashionBusinesses,
];

  const business = allBusinesses.find(
    (b) => b.id === selectedProduct.businessId
  );

setSelectedBusiness(business);
setSelectedBusiness({
  ...business,
  previousPage: "product",
});

setPage("business");
}}
style={{
padding:"12px 18px",
border:"none",
borderRadius:"14px",
background:"#5A1848",
color:"white",
cursor:"pointer",
fontWeight:"600"
}}
>
View Business
</button>

</div>

</div>

);

}
