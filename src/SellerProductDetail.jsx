import { useState } from "react";

export default function SellerProductDetail({
  setPage,
  selectedSellerProduct,
  setSelectedSellerProduct,
}) {
  const [product, setProduct] = useState(selectedSellerProduct);
  const [editing, setEditing] = useState(false);

  if (!selectedSellerProduct) {
    return (
      <div
        style={{
          background: "#FFF8EF",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <button
          onClick={() => setPage("sellerdashboard")}
          style={{
            border: "none",
            background: "none",
            color: "#5A1848",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <p style={{ marginTop: "30px" }}>
          Product not found.
        </p>
      </div>
    );
  }



  const updateField = (field, value) => {
    setProduct({
      ...product,
      [field]: value,
    });
  };

  const saveChanges = () => {
    setSelectedSellerProduct(product);
    setEditing(false);

    alert("Product updated successfully.");
  };

  return (
    <div
      style={{
        background: "#FFF8EF",
        minHeight: "100vh",
        padding: "20px",
        paddingBottom: "100px",
        fontFamily: "Arial",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >

        <button
          onClick={() => setPage("sellerdashboard")}
          style={{
            border: "none",
            background: "none",
            color: "#5A1848",
            fontWeight: "600",
            fontSize: "16px",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← Back
        </button>

        <button
          onClick={() => {
            if (editing) {
              saveChanges();
            } else {
              setEditing(true);
            }
          }}
          style={{
            border: "none",
            borderRadius: "12px",
            padding: "10px 18px",
            background: "#5A1848",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {editing ? "Save Changes" : "✏️ Edit"}
        </button>

      </div>


      {/* PRODUCT IMAGE */}

      <div
        style={{
          height: "320px",
          background:
            product.color1 && product.color2
              ? `linear-gradient(135deg, ${product.color1}, ${product.color2})`
              : "#F7C7A5",
          borderRadius: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "110px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.emoji || "🍰"}

        {editing && (
          <button
            style={{
              position: "absolute",
              bottom: "15px",
              right: "15px",
              border: "none",
              borderRadius: "12px",
              padding: "10px 14px",
              background: "white",
              color: "#5A1848",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            📷 Change Image
          </button>
        )}
      </div>


      {/* PRODUCT NAME */}

      <div style={{ marginTop: "22px" }}>

        <label
          style={{
            display: "block",
            fontSize: "13px",
            color: "#777",
            marginBottom: "7px",
          }}
        >
          Product Name
        </label>

        {editing ? (
          <input
            value={product.name || ""}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
            style={inputStyle}
          />
        ) : (
          <h1
            style={{
              margin: 0,
              color: "#35142E",
              fontSize: "26px",
            }}
          >
            {product.name}
          </h1>
        )}

      </div>


      {/* BUSINESS */}

      <p
        style={{
          marginTop: "12px",
          marginBottom: "8px",
          color: "#777",
          fontSize: "15px",
        }}
      >
        by {product.businessName || "Your Business"}
      </p>


      {/* RATING / LOCATION */}

      <p
        style={{
          marginTop: 0,
          color: "#777",
        }}
      >
        ⭐ {product.rating || "—"} • 📍{" "}
        {product.distance || product.location || "Mumbai"}
      </p>


      {/* PRICE */}

      <div style={{ marginTop: "20px" }}>

        <label
          style={{
            display: "block",
            fontSize: "13px",
            color: "#777",
            marginBottom: "7px",
          }}
        >
          Price
        </label>

        {editing ? (
          <input
            value={product.price || ""}
            onChange={(e) =>
              updateField("price", e.target.value)
            }
            style={inputStyle}
          />
        ) : (
          <h2
            style={{
              margin: 0,
              color: "#5A1848",
              fontSize: "22px",
            }}
          >
            {product.price}
          </h2>
        )}

      </div>


      {/* CATEGORY */}

      <Section title="Category">

        {editing ? (
          <select
            value={product.category || "Desserts"}
            onChange={(e) =>
              updateField("category", e.target.value)
            }
            style={inputStyle}
          >
            <option>Desserts</option>
            <option>Fashion</option>
            <option>Jewellery</option>
            <option>Handmade</option>
            <option>Crochet</option>
            <option>Gifts</option>
          </select>
        ) : (
          <span style={pillStyle}>
            {product.category || "Desserts"}
          </span>
        )}

      </Section>


      {/* SUBCATEGORY */}

      <Section title="Subcategory">

        {editing ? (
          <input
            value={product.subcategory || ""}
            onChange={(e) =>
              updateField("subcategory", e.target.value)
            }
            placeholder="e.g. Women's Fashion / Resin / Crochet"
            style={inputStyle}
          />
        ) : (
          <p style={textStyle}>
            {product.subcategory || "Not added"}
          </p>
        )}

      </Section>


      {/* ABOUT */}

      <Section title="About">

        {editing ? (
          <textarea
            value={product.about || ""}
            onChange={(e) =>
              updateField("about", e.target.value)
            }
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        ) : (
          <p style={textStyle}>
            {product.about ||
              "Product description not added yet."}
          </p>
        )}

      </Section>


      {/* QUANTITY */}

      <Section title="Quantity & Inventory">

        {editing ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >

            <div>
              <label style={smallLabel}>
                Quantity
              </label>

              <input
                value={product.quantity || ""}
                onChange={(e) =>
                  updateField("quantity", e.target.value)
                }
                placeholder="e.g. 6"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={smallLabel}>
                Unit
              </label>

              <select
                value={product.quantityUnit || "Pieces"}
                onChange={(e) =>
                  updateField(
                    "quantityUnit",
                    e.target.value
                  )
                }
                style={inputStyle}
              >
                <option>Pieces</option>
                <option>Pairs</option>
                <option>Sets</option>
                <option>Box</option>
                <option>Pack</option>
                <option>g</option>
                <option>kg</option>
                <option>ml</option>
                <option>L</option>
              </select>
            </div>

          </div>
        ) : (
          <p style={textStyle}>
            {product.quantity
              ? `${product.quantity} ${
                  product.quantityUnit || "Pieces"
                }`
              : "Quantity not added"}
          </p>
        )}

      </Section>


      {/* STOCK TYPE */}

      <Section title="Stock Type">

        {editing ? (
          <select
            value={product.stockType || "In Stock"}
            onChange={(e) =>
              updateField("stockType", e.target.value)
            }
            style={inputStyle}
          >
            <option>In Stock</option>
            <option>Made to Order</option>
            <option>Out of Stock</option>
          </select>
        ) : (
          <span
            style={{
              ...pillStyle,
              background:
                product.stockType === "Out of Stock"
                  ? "#F7D9DF"
                  : "#E8F5EC",
            }}
          >
            {product.stockType || "In Stock"}
          </span>
        )}

      </Section>


      {/* PREPARATION TIME */}

      {(product.stockType === "Made to Order" ||
        editing) && (
        <Section title="Preparation Time">

          {editing ? (
            <input
              value={product.preparationTime || ""}
              onChange={(e) =>
                updateField(
                  "preparationTime",
                  e.target.value
                )
              }
              placeholder="e.g. 3 days"
              style={inputStyle}
            />
          ) : (
            <p style={textStyle}>
              {product.preparationTime ||
                "Not specified"}
            </p>
          )}

        </Section>
      )}


      {/* VARIANTS */}

      <Section title="Variants">

        {editing ? (
          <textarea
            value={product.variants || ""}
            onChange={(e) =>
              updateField("variants", e.target.value)
            }
            placeholder={
              "Example:\nSize: S, M, L, XL\nColour: Black, White"
            }
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />
        ) : (
          <p style={textStyle}>
            {product.variants ||
              "No variants added"}
          </p>
        )}

      </Section>


      {/* DELIVERY / PICKUP */}

      <Section title="Availability">

        <div
          style={{
            background: "white",
            borderRadius: "18px",
            padding: "18px",
            boxShadow:
              "0 6px 18px rgba(0,0,0,.05)",
          }}
        >

          {editing ? (
            <>
              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}
              >
                <span>🚚 Delivery Available</span>

                <input
                  type="checkbox"
                  checked={
                    product.deliveryAvailable !== false
                  }
                  onChange={(e) =>
                    updateField(
                      "deliveryAvailable",
                      e.target.checked
                    )
                  }
                />
              </label>

              <label
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                }}
              >
                <span>🏪 Pickup Available</span>

                <input
                  type="checkbox"
                  checked={
                    product.pickupAvailable !== false
                  }
                  onChange={(e) =>
                    updateField(
                      "pickupAvailable",
                      e.target.checked
                    )
                  }
                />
              </label>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 12px" }}>
                🚚{" "}
                {product.deliveryAvailable !== false
                  ? "Delivery Available"
                  : "Delivery Unavailable"}
              </p>

              <p style={{ margin: 0 }}>
                🏪{" "}
                {product.pickupAvailable !== false
                  ? "Pickup Available"
                  : "Pickup Unavailable"}
              </p>
            </>
          )}

        </div>

      </Section>


      {/* OFFER */}

      <Section title="Offer">

        {editing ? (
          <input
            value={product.offer || ""}
            onChange={(e) =>
              updateField("offer", e.target.value)
            }
            placeholder="e.g. 15% OFF or Buy 1 Get 1"
            style={inputStyle}
          />
        ) : (
          <p style={textStyle}>
            {product.offer || "No offer added"}
          </p>
        )}

      </Section>


      {/* SELLER ACTIONS */}

      {editing && (
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "12px",
          }}
        >

          <button
            onClick={() => {
              setProduct(selectedSellerProduct);
              setEditing(false);
            }}
            style={{
              flex: 1,
              height: "50px",
              borderRadius: "14px",
              border: "1px solid #5A1848",
              background: "white",
              color: "#5A1848",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={saveChanges}
            style={{
              flex: 1,
              height: "50px",
              border: "none",
              borderRadius: "14px",
              background: "#5A1848",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>

        </div>
      )}

    </div>
  );
}


/* ================= HELPERS ================= */

function Section({ title, children }) {
  return (
    <div style={{ marginTop: "32px" }}>

      <h3
        style={{
          marginBottom: "12px",
          color: "#35142E",
          fontSize: "19px",
        }}
      >
        {title}
      </h3>

      {children}

    </div>
  );
}


/* ================= STYLES ================= */

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  borderRadius: "12px",
  border: "1px solid #DDD",
  background: "white",
  fontSize: "15px",
  outline: "none",
};

const textStyle = {
  margin: 0,
  lineHeight: "25px",
  color: "#666",
  fontSize: "15px",
};

const pillStyle = {
  display: "inline-block",
  padding: "9px 15px",
  borderRadius: "20px",
  background: "#F6DCE8",
  color: "#5A1848",
  fontWeight: "600",
  fontSize: "14px",
};

const smallLabel = {
  display: "block",
  fontSize: "12px",
  color: "#777",
  marginBottom: "6px",
};