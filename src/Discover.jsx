/* eslint-disable */
import { listReels } from "./services/reelService";
import { listBusinesses } from "./services/businessService";
import { useAsync } from "./hooks/useAsync";
export default function Discover({
  setPage,
  setSelectedBusiness,
}) {
  
  const allReels = [];
  const allBusinesses = [];
  

  

  return (
    <div
     style={{
background:"#FFF8EF",
height:"100vh",
overflowY:"auto",
scrollSnapType:"y mandatory",
padding:"20px",
paddingBottom:"20px",
fontFamily:"Arial",
}}
    >


      {allReels.map((reel, index) => (
  <div
    key={reel.id || index}
   
    style={{
  background: "white",
  borderRadius: "24px",
  overflow: "hidden",
  marginBottom: "20px",
  minHeight: "92vh",
display: "flex",
flexDirection: "column",
  scrollSnapAlign: "start",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
}}
  >
          <div
  style={{
    height: "62vh",
flexShrink: 0,
    background: reel.color,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "110px",
    position: "relative",
  }}
>

<button
onClick={(e)=>{
e.stopPropagation();
}}
style={{
position:"absolute",
top:"18px",
right:"18px",
width:"46px",
height:"46px",
border:"none",
borderRadius:"50%",
background:"rgba(255,255,255,.9)",
cursor:"pointer",
fontSize:"20px",
}}
>
❤️
</button>

{reel.emoji}


</div>

         <div
style={{
    padding: "14px",
    flex:1,
    display:"flex",
    flexDirection:"column",
}}
>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >

    {/* LEFT SIDE */}
    <div
      style={{
        display: "flex",
        alignItems:"flex-start",
        gap: "12px",
        flex: 1,
      }}
    >

      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: "#F4EEF2",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "24px",
          flexShrink: 0,
        }}
      >
        🍰
      </div>

      <div
style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-start",
}}
>
        <h3
          style={{
            margin: 0,
            color: "#35142E",
            fontSize: "20px",
          }}
        >
          {reel.business}
        </h3>

        <p
          style={{
margin:"4px 0 0",
color:"#666",
fontSize:"14px",
lineHeight:"20px",
display:"-webkit-box",
WebkitLineClamp:2,
WebkitBoxOrient:"vertical",
overflow:"hidden",
}}
        >
          {reel.caption}
        </p>
      </div>

    </div>

    {/* KM */}
    <p
      style={{
        margin: 0,
        color: "#888",
        fontSize: "14px",
        whiteSpace: "nowrap",
      }}
    >
      📍 {reel.distance}
    </p>

  </div>

  <div
style={{
  display:"flex",
  gap:"12px",
  marginTop:"8px",
}}
>

   <button
onClick={(e) => {
  e.stopPropagation();

  if (navigator.share) {
    navigator.share({
      title: reel.business,
      text: `Check out ${reel.business} on Tibu!`,
      url: window.location.href,
    });
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert("Link copied!");
  }
}}
style={{
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "14px",
  background: "#5A1848",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
}}
>
🔗 Share
</button>

    <button
onClick={() => {

const business = allBusinesses.find(
  (item) => item.businessName === reel.business
);

setSelectedBusiness(business);
setPage("business");

}}
style={{
  flex: 1,
  padding: "12px",
  border: "none",
  borderRadius: "14px",
  background: "#EFE8EC",
  color: "#5A1848",
  fontWeight: "600",
  cursor: "pointer",
}}
>
🏪 View Business
</button>

  </div>

</div>
        </div>
      ))}
    </div>
  );
}