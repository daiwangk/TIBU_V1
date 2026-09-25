
export default function Reel({
  setPage,
  selectedReel,
}) {
    if (!selectedReel) {
  return (
    <div style={{ padding: "30px" }}>
      <button onClick={() => setPage("discover")}>
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
paddingBottom:"120px",
fontFamily:"Arial"
}}
>
<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}
>

<button
onClick={() => setPage("discover")}
style={{
border:"none",
background:"none",
fontSize:"18px",
cursor:"pointer",
fontWeight:"600",
color:"#35142E"
}}
>
← Back
</button>

<button
style={{
border:"none",
background:"#F3EDF1",
width:"45px",
height:"45px",
borderRadius:"50%",
fontSize:"20px"
}}
>
❤️
</button>

</div>
<div
style={{
marginTop:"20px",
height:"540px",
borderRadius:"28px",
background:"#EFD8C5",
display:"flex",
justifyContent:"center",
alignItems:"center",
fontSize:"150px",
position:"relative"
}}
>

{selectedReel.emoji}

</div>
<h2
style={{
marginTop:"22px",
marginBottom:"8px",
color:"#35142E"
}}
>
{selectedReel.business}
</h2>

<p
style={{
margin:0,
color:"#777"
}}
>
📍 {selectedReel.area}
</p>

<p
style={{
marginTop:"18px",
lineHeight:"26px",
color:"#555"
}}
>
{selectedReel.caption}
</p>
<div
style={{
display:"flex",
gap:"12px",
marginTop:"28px"
}}
>

<button
style={{
flex:1,
padding:"15px",
background:"#25D366",
border:"none",
borderRadius:"16px",
color:"white",
fontWeight:"700",
cursor:"pointer"
}}
>
💬 WhatsApp
</button>

<button
style={{
flex:1,
padding:"15px",
background:"#5A1848",
border:"none",
borderRadius:"16px",
color:"white",
fontWeight:"700",
cursor:"pointer"
}}
>
🛍 View Shop
</button>

</div>
</div>
);
}