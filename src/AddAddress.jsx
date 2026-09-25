import { useState } from "react";

export default function AddAddress({
  setPage,
  addresses,
  setAddresses,
}) {
  const [search, setSearch] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [label, setLabel] = useState("Home");

  const places = [
    {
      name: "Sunrise Apartments",
      address: "14th Road, Khar West, Mumbai, Maharashtra — 400052",
    },
    {
      name: "XYZ Tower",
      address: "Andheri East, Mumbai, Maharashtra — 400069",
    },
    {
      name: "Khar Road",
      address: "Khar West, Mumbai, Maharashtra — 400052",
    },
  ];

  const filteredPlaces = places.filter((place) =>
    `${place.name} ${place.address}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF7F9",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >

      {/* BACK BUTTON */}

      <div
        style={{
          width: "100%",
          textAlign: "left",
          marginBottom: "16px",
        }}
      >
        <button
          onClick={() => setPage("addresses")}
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

      {/* HEADER */}

      <h1
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "32px",
          color: "#35142E",
        }}
      >
        📍 Add New Address
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "30px",
        }}
      >
        Search and select your location.
      </p>

      {/* MAIN CARD */}

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "28px",
          boxShadow: "0 8px 18px rgba(0,0,0,.05)",
        }}
      >

        {/* SEARCH */}

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#35142E",
            fontWeight: "600",
          }}
        >
          Search Location
        </label>

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedPlace(null);
          }}
          placeholder="Search your building, area or locality"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #DDD",
            boxSizing: "border-box",
            fontSize: "15px",
            outline: "none",
          }}
        />

        {/* SEARCH RESULTS */}

        {search && !selectedPlace && (
          <div
            style={{
              marginTop: "10px",
              border: "1px solid #EEE",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            {filteredPlaces.length > 0 ? (
              filteredPlaces.map((place, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedPlace(place);
                    setSearch(place.name);
                  }}
                  style={{
                    padding: "15px",
                    borderBottom:
                      index !== filteredPlaces.length - 1
                        ? "1px solid #F2F2F2"
                        : "none",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#35142E",
                    }}
                  >
                    📍 {place.name}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    {place.address}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "15px",
                  color: "#777",
                }}
              >
                No location found.
              </div>
            )}
          </div>
        )}

        {/* SELECTED LOCATION */}

        {selectedPlace && (
          <div style={{ marginTop: "25px" }}>

            <h3
              style={{
                marginBottom: "12px",
                color: "#35142E",
              }}
            >
              Selected Location
            </h3>

            {/* MAP PLACEHOLDER */}

            <div
              style={{
                height: "220px",
                borderRadius: "16px",
                background: "#EAF0EA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "#555",
                }}
              >
                <div style={{ fontSize: "42px" }}>📍</div>

                <strong>{selectedPlace.name}</strong>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "14px",
                  }}
                >
                  {selectedPlace.address}
                </div>
              </div>
            </div>

            {/* ADDRESS */}

            <div style={{ marginTop: "25px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  color: "#35142E",
                  fontWeight: "600",
                }}
              >
                Full Address
              </label>

              <textarea
                defaultValue={`${selectedPlace.name}, ${selectedPlace.address}`}
                rows="3"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "12px",
                  border: "1px solid #DDD",
                  boxSizing: "border-box",
                  fontSize: "15px",
                  resize: "vertical",
                  outline: "none",
                }}
              />

            </div>

            {/* LABEL */}

            <div style={{ marginTop: "22px" }}>

              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: "#35142E",
                  fontWeight: "600",
                }}
              >
                Save as
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                {["Home", "Work", "Other"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setLabel(item)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      border:
                        label === item
                          ? "2px solid #5A1848"
                          : "1px solid #DDD",
                      background:
                        label === item ? "#F4E8EF" : "white",
                      color: "#5A1848",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

            </div>

            {/* SAVE */}

            <button
             onClick={() => {
  const newAddress = {
    id: Date.now(),
    label: label,
    address: `${selectedPlace.name}, ${selectedPlace.address}`,
    selected: true,
  };

  setAddresses([
    ...addresses.map((address) => ({
      ...address,
      selected: false,
    })),
    newAddress,
  ]);

  setPage("addresses");
}}
              style={{
                width: "100%",
                marginTop: "28px",
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
              Save Address
            </button>

          </div>
        )}

      </div>

    </div>
  );
}