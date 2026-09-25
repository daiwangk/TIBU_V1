import BusinessCard from "./Components/BusinessCard";

export default function BusinessViewAll({
  setPage,
  businesses,
  title,
  previousPage,
  setSelectedBusiness,

  savedBusinesses,
  setSavedBusinesses,
}){
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
      {/* Back */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
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

      <h1
        style={{
          margin: 0,
          color: "#35142E",
          fontSize: "30px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          color: "#777",
          marginTop: "8px",
          marginBottom: "30px",
        }}
      >
        {businesses.length} businesses
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "18px",
        }}
      >
        {businesses.map((business,index)=>(
          <BusinessCard
  key={index}
  business={business}

  name={business.businessName}
  category={business.category}
  area={business.location}
  image={business.businessEmoji}
  color="#F7E7F5"

  savedBusinesses={savedBusinesses}
  setSavedBusinesses={setSavedBusinesses}

  onViewBusiness={() => {
    setSelectedBusiness(business);
    setPage("business");
  }}
/>
        ))}
      </div>
    </div>
  );
}