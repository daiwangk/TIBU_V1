export default function Addresses({
  setPage,
  addresses,
  setAddresses,
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF7F9",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >

      {/* ================= BACK BUTTON ================= */}

     <div
  style={{
    display: "block",
    width: "100%",
    textAlign: "left",
    marginBottom: "16px",
  }}
>
        <button
          onClick={() => setPage("profile")}
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


      {/* ================= HEADER ================= */}

      <h1
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "32px",
          color: "#35142E",
        }}
      >
        📍 Manage Addresses
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "35px",
        }}
      >
        Save your locations for easier nearby discovery.
      </p>


      {/* ================= SAVED LOCATIONS ================= */}

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 8px 18px rgba(0,0,0,.05)",
        }}
      >

        <h2
          style={{
            marginTop: 0,
            marginBottom: "20px",
            color: "#35142E",
          }}
        >
          Your saved locations
        </h2>

{/* ================= SAVED ADDRESSES ================= */}

{addresses.map((item) => (
  <div
    key={item.id}
    style={{
      padding: "18px 0",
      borderBottom: "1px solid #F2F2F2",
    }}
  >

    {/* TOP ROW */}

    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >

      {/* LEFT CONTENT */}

      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >

        {/* HEADING */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "22px",
              lineHeight: "1",
            }}
          >
            {item.label === "Home"
              ? "🏠"
              : item.label === "Work"
              ? "💼"
              : "📍"}
          </span>

          <h3
            style={{
              margin: 0,
              color: "#35142E",
              fontSize: "18px",
            }}
          >
            {item.label}
          </h3>
        </div>

        {/* ADDRESS */}

        <div
          style={{
            marginTop: "7px",
            padding: 0,
            color: "#777",
            lineHeight: "22px",
            fontSize: "15px",
            textAlign: "left",
          }}
        >
          {item.address}
        </div>

      </div>

      {/* SELECTED CHECK */}

      <span
        onClick={() => {
          setAddresses(
            addresses.map((address) => ({
              ...address,
              selected: address.id === item.id,
            }))
          );
        }}
        style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: item.selected ? "#3BA55D" : "white",
          border: item.selected
            ? "none"
            : "2px solid #CCC",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "700",
          flexShrink: 0,
          marginLeft: "20px",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        {item.selected ? "✓" : ""}
      </span>

    </div>

    {/* ACTION BUTTONS */}

    <div
      style={{
        display: "flex",
        gap: "10px",
        marginTop: "12px",
      }}
    >

      <button
  onClick={() => {
    setPage("addaddress");
  }}
  style={{
          padding: "7px 14px",
          border: "1px solid #DDD",
          borderRadius: "9px",
          background: "white",
          color: "#5A1848",
          fontWeight: "600",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Edit
      </button>

      <button
        onClick={() => {
          setAddresses(
            addresses.filter(
              (address) => address.id !== item.id
            )
          );
        }}
        style={{
          padding: "7px 14px",
          border: "1px solid #F0CACA",
          borderRadius: "9px",
          background: "#FFF7F7",
          color: "#D94A4A",
          fontWeight: "600",
          fontSize: "13px",
          cursor: "pointer",
        }}
      >
        Delete
      </button>

    </div>

  </div>
))}

{/* ================= ADD ADDRESS ================= */}

<button
  onClick={() => setPage("addaddress")}
  style={{
    width: "100%",
    marginTop: "20px",
    padding: "15px",
    border: "none",
    borderRadius: "14px",
    background: "#5A1848",
    color: "white",
    fontWeight: "600",
    fontSize: "15px",
    cursor: "pointer",
  }}
>
  + Add New Address
</button>

      </div>

    </div>
  );
}