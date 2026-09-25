export default function Profile({
  setPage,
  profile,
  profileStats,
}) {

  return (
    <div
      style={{
        padding: "40px",
        background: "#FAF7F9",
        minHeight: "100vh",
      }}
    >

      {/* ================= HEADER ================= */}

      <h1
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "32px",
          color: "#35142E",
        }}
      >
        👤 My Profile
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "35px",
        }}
      >
        Manage your account and activity.
      </p>

      {/* ================= PROFILE CARD ================= */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 10px 25px rgba(0,0,0,.06)",
          textAlign: "center",
        }}
      >

        <div
          style={{
            width: "95px",
            height: "95px",
            borderRadius: "50%",
            background: "#F4E8EF",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "42px",
            margin: "0 auto",
          }}
        >
          {profile.avatarUrl ? (
  <img
    src={profile.avatarUrl}
    alt="Profile"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
) : (
  profile.avatar
)}
        </div>

        <h2
          style={{
            marginTop: "18px",
            marginBottom: "6px",
            color: "#35142E",
          }}
        >
          {profile.fullName}
        </h2>

        <p
  style={{
    margin: 0,
    color: "#777",
  }}
>
  @{profile.username}
</p>

<p
  style={{
    marginTop: "8px",
    marginBottom: 0,
    color: "#777",
    fontSize: "14px",
  }}
>
  📞 {profile.phone || "Phone number not added"}
</p>

        <button
  onClick={() => setPage("editprofile")}
  style={{
    marginTop: "22px",
    padding: "12px 24px",
    border: "none",
    borderRadius: "14px",
    background: "#5A1848",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
  }}
>
  Edit Profile
</button>

      </div>
      {/* ================= STATS ================= */}

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "16px",
    marginTop: "30px",
  }}
>
  {[
  { number: profileStats.saved, label: "Saved" },
  { number: profileStats.reviews, label: "Reviews" },
  { number: profileStats.addresses, label: "Addresses" },
].map((item, index) => (
    <div
      key={index}
      style={{
        background: "white",
        borderRadius: "18px",
        padding: "18px",
        textAlign: "center",
        boxShadow: "0 8px 18px rgba(0,0,0,.05)",
      }}
    >
      <h2
        style={{
          margin: 0,
          color: "#5A1848",
        }}
      >
        {item.number}
      </h2>

      <p
        style={{
          marginTop: "8px",
          marginBottom: 0,
          fontSize: "14px",
          color: "#777",
        }}
      >
        {item.label}
      </p>
    </div>
  ))}
</div>
{/* ================= QUICK ACTIONS ================= */}

<h2
  style={{
    marginTop: "40px",
    marginBottom: "20px",
    color: "#35142E",
  }}
>
  ⚡ Quick Actions
</h2>

<div
  style={{
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 18px rgba(0,0,0,.05)",
  }}
>

  {/* MANAGE ADDRESSES */}

  <div
    onClick={() => setPage("addresses")}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 22px",
      borderBottom: "1px solid #F2F2F2",
      cursor: "pointer",
    }}
  >
    <span
      style={{
        fontWeight: "600",
        color: "#35142E",
      }}
    >
      📍 Manage Addresses
    </span>

    <span
      style={{
        fontSize: "22px",
        color: "#999",
      }}
    >
      ›
    </span>
  </div>

  {/* TIBU OFFERS */}

 <div 
  onClick={() => setPage("offers")}
  style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: "20px 22px", 
    cursor: "pointer", 
  }} 
>
    <span
      style={{
        fontWeight: "600",
        color: "#35142E",
      }}
    >
      💜 Tibu Offers
    </span>

    <span
      style={{
        fontSize: "22px",
        color: "#999",
      }}
    >
      ›
    </span>
  </div>

</div>
{/* ================= RECENT ACTIVITY ================= */}

<h2
  style={{
    marginTop: "40px",
    marginBottom: "20px",
    color: "#35142E",
  }}
>
  🕒 Recent Activity
</h2>

<div
  style={{
    background: "white",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 18px rgba(0,0,0,.05)",
  }}
>

  {/* Recently Viewed */}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 22px",
      borderBottom: "1px solid #F2F2F2",
      opacity: 0.6,
      cursor: "not-allowed",
    }}
  >
    <span
      style={{
        fontWeight: "600",
        color: "#666",
      }}
    >
      👀 Recently Viewed
    </span>

    <span
      style={{
        fontSize: "13px",
        fontWeight: "600",
        color: "#999",
      }}
    >
      🔒 Coming Soon
    </span>
  </div>


  {/* Recently Contacted */}

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 22px",
      opacity: 0.6,
      cursor: "not-allowed",
    }}
  >
    <span
      style={{
        fontWeight: "600",
        color: "#666",
      }}
    >
      💬 Recently Contacted
    </span>

    <span
      style={{
        fontSize: "13px",
        fontWeight: "600",
        color: "#999",
      }}
    >
      🔒 Coming Soon
    </span>
  </div>

</div>
{/* ================= PREFERENCES ================= */}

<h2
style={{
marginTop:"40px",
marginBottom:"20px",
color:"#35142E"
}}
>
⚙️ Preferences
</h2>

<div
style={{
background:"white",
borderRadius:"20px",
overflow:"hidden",
boxShadow:"0 8px 18px rgba(0,0,0,.05)"
}}
>

{/* Notification Preferences */}

<div
  onClick={() => setPage("notificationPreferences")}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 22px",
    borderBottom: "1px solid #F2F2F2",
    cursor: "pointer",
  }}
>
  <span
    style={{
      fontWeight: "600",
      color: "#35142E",
    }}
  >
    🔔 Notification Preferences
  </span>

  <span
    style={{
      fontSize: "22px",
      color: "#999",
    }}
  >
    ›
  </span>
</div>

{/* Dark Mode */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 22px",
borderBottom:"1px solid #F2F2F2",
opacity:0.6,
cursor:"not-allowed"
}}
>

<span
style={{
fontWeight:"600",
color:"#666"
}}
>
🌙 Dark Mode
</span>

<span
style={{
fontSize:"13px",
fontWeight:"600",
color:"#999"
}}
>
🔒 Coming Soon
</span>

</div>

{/* Language */}

<div
style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 22px",
opacity:0.6,
cursor:"not-allowed"
}}
>

<span
style={{
fontWeight:"600",
color:"#666"
}}
>
🌐 Language
</span>

<span
style={{
fontSize:"13px",
fontWeight:"600",
color:"#999"
}}
>
🔒 Coming Soon
</span>

</div>

</div>
{/* ================= ACCOUNT ================= */}

<h2 
  style={{ 
    marginTop:"40px", 
    marginBottom:"20px", 
    color:"#35142E" 
  }} 
> 
  👤 Account 
</h2> 
 
<div 
  style={{ 
    background:"white", 
    borderRadius:"20px", 
    overflow:"hidden", 
    boxShadow:"0 8px 18px rgba(0,0,0,.05)" 
  }} 
> 
  {[ 
    "🔒 Privacy & Security", 
    "💬 Help & Feedback", 
    "📄 Terms & Conditions", 
    "ℹ️ About Tibu", 
  ].map((item,index)=>( 
 
    <div 
      key={index} 
     onClick={() => {
  if (item === "🔒 Privacy & Security") {
    setPage("privacySecurity");
  }

  if (item === "💬 Help & Feedback") {
    setPage("helpFeedback");
  }

  if (item === "📄 Terms & Conditions") {
    setPage("termsConditions");
  }

  if (item === "ℹ️ About Tibu") {
    setPage("aboutTibu");
  }
}}
      style={{ 
        display:"flex", 
        justifyContent:"space-between", 
        alignItems:"center", 
        padding:"20px 22px", 
        borderBottom:index !== 3 ? "1px solid #F2F2F2" : "none", 
        cursor:"pointer" 
      }} 
    > 
 
      <span 
        style={{ 
          fontWeight:"600", 
          color:"#35142E" 
        }} 
      > 
        {item} 
      </span> 
 
      <span 
        style={{ 
          fontSize:"22px", 
          color:"#999" 
        }} 
      > 
        › 
      </span> 
 
    </div> 
 
  ))} 
</div>
{/* ================= SELLER CARD ================= */}

<div
style={{
background:"linear-gradient(135deg,#5A1848,#8E4D6D)",
borderRadius:"24px",
padding:"28px",
marginTop:"30px",
marginBottom:"30px",
color:"white",
boxShadow:"0 10px 25px rgba(0,0,0,.08)"
}}
>

<div
style={{
fontSize:"42px"
}}
>
🏪
</div>

<div
style={{
display:"inline-block",
background:"#F6DCE8",
padding:"10px 20px",
borderRadius:"999px",
marginTop:"16px",
marginBottom:"18px",
boxShadow:"0 4px 12px rgba(0,0,0,.08)"
}}
>

<h2
style={{
margin:0,
color:"#35142E",
fontSize:"24px",
fontWeight:"700"
}}
>
Grow Your Business with Tibu
</h2>

</div>

<p
style={{
lineHeight:"28px",
opacity:.95,
marginBottom:"24px",
fontSize:"15px"
}}
>
Reach more local customers by showcasing your products,
reels and offers on Tibu.
</p>

<button
  onClick={() => setPage("sellerregister")}
  style={{
    padding:"14px 22px",
    border:"none",
    borderRadius:"14px",
    background:"#F8EEDF",
    color:"#35142E",
    fontWeight:"700",
    fontSize:"15px",
    cursor:"pointer",
  }}
>
  Register Your Business
</button>

</div>
      {/* ================= LOGOUT ================= */}

<button
  onClick={() => {
    setPage("home");
  }}
  style={{
    width: "100%",
    marginTop: "40px",
    marginBottom: "30px",   // ADD THIS
    padding: "16px",
    border: "none",
    borderRadius: "18px",
    background: "#D94A4A",
    color: "white",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
  }}
>
  Logout
</button>

</div>
  );
}