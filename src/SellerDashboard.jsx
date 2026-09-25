/* eslint-disable */
import { useState } from "react";
import ProductCard from "./Components/ProductCard";
import ReelCard from "./Components/ReelCard";

export default function SellerDashboard({
  setPage,
  setSelectedProduct,
  setPreviousPage,
  setSellerMode,
}) {
  /* =========================================================
     TEMPORARY SELLER DATA
     Backend will replace this later
  ========================================================= */

  const [seller, setSeller] = useState({
    businessName: "Sweet Crumbs",
    category: "Desserts",
    city: "Mumbai",
    locality: "Bandra West",
    phone: "9876543210",
    whatsapp: "9876543210",
    description:
      "Freshly baked brownies, cakes and desserts made with premium ingredients.",
    deliveryAvailable: true,
    pickupAvailable: true,
    deliveryCharge: "₹50",
    logo: "🍰",
    bannerEmoji: "🍰",
  });

  const [activeTab, setActiveTab] = useState("products");

  /* =========================================================
     PRODUCTS
  ========================================================= */

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Fudgy Brownie Box",
      price: 99,
      category: "Desserts",
      stockStatus: "In Stock",
      availableToday: true,
      views: 120,
      saves: 18,
      rating: 4.9,
      distance: "1.2 km",
      emoji: "🍫",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
    {
      id: 2,
      name: "Chocolate Brownie",
      price: 180,
      category: "Desserts",
      stockStatus: "In Stock",
      availableToday: true,
      views: 96,
      saves: 14,
      rating: 4.8,
      distance: "1.2 km",
      emoji: "🍫",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
    {
      id: 3,
      name: "Red Velvet Cake",
      price: 650,
      category: "Desserts",
      stockStatus: "In Stock",
      availableToday: true,
      views: 72,
      saves: 11,
      rating: 4.9,
      distance: "1.2 km",
      emoji: "🎂",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
    {
      id: 4,
      name: "Dessert Box",
      price: 450,
      category: "Desserts",
      stockStatus: "Made to Order",
      availableToday: true,
      views: 55,
      saves: 9,
      rating: 4.7,
      distance: "1.2 km",
      emoji: "🍮",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
    {
      id: 5,
      name: "Chocolate Cupcake",
      price: 150,
      category: "Desserts",
      stockStatus: "In Stock",
      availableToday: true,
      views: 43,
      saves: 7,
      rating: 4.8,
      distance: "1.2 km",
      emoji: "🧁",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
    {
      id: 6,
      name: "Mini Celebration Cake",
      price: 399,
      category: "Desserts",
      stockStatus: "Made to Order",
      availableToday: false,
      views: 31,
      saves: 5,
      rating: 4.6,
      distance: "1.2 km",
      emoji: "🎂",
      color1: "#9B684A",
      color2: "#E9C09E",
      businessName: "Sweet Crumbs",
      businessPhone: "9876543210",
    },
  ]);

  /* =========================================================
     POSTS / DISCOVER
  ========================================================= */

  const posts = [
    {
      id: 1,
      caption: "Fresh brownies ready for today 🤎",
      views: 86,
      saves: 12,
      emoji: "🍫",
      business: "Sweet Crumbs",
    },
    {
      id: 2,
      caption: "New dessert box available!",
      views: 54,
      saves: 8,
      emoji: "🍮",
      business: "Sweet Crumbs",
    },
    {
      id: 3,
      caption: "Behind the scenes at Sweet Crumbs ✨",
      views: 42,
      saves: 6,
      emoji: "🎂",
      business: "Sweet Crumbs",
    },
  ];

  /* =========================================================
     REVIEWS
  ========================================================= */

  const reviews = [
    {
      name: "Ayesha",
      rating: 5,
      review: "The brownies were absolutely delicious!",
      date: "2 days ago",
      product: "Fudgy Brownie Box",
    },
    {
      name: "Sara",
      rating: 4,
      review: "Really tasty and nicely packed.",
      date: "5 days ago",
      product: "Chocolate Brownie",
    },
    {
      name: "Mahi",
      rating: 5,
      review: "Loved the dessert box. Everything tasted fresh.",
      date: "1 week ago",
      product: "Dessert Box",
    },
  ];

  /* =========================================================
     INTERNAL PAGES
  ========================================================= */

  const [internalPage, setInternalPage] = useState("dashboard");

  const [editingProfile, setEditingProfile] = useState(false);

  /* =========================================================
     SAVED STATE
     Used only so ProductCard / ReelCard work correctly
  ========================================================= */

  const [savedProducts, setSavedProducts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);

  /* =========================================================
     PROFILE EDIT STATE
  ========================================================= */

  const [editBusinessName, setEditBusinessName] = useState(
    seller.businessName
  );

  const [editDescription, setEditDescription] = useState(
    seller.description
  );

  const [editCategory, setEditCategory] = useState(seller.category);
  const [editCity, setEditCity] = useState(seller.city);
  const [editLocality, setEditLocality] = useState(seller.locality);
  const [editPhone, setEditPhone] = useState(seller.phone);
  const [editWhatsapp, setEditWhatsapp] = useState(seller.whatsapp);

  const [editDelivery, setEditDelivery] = useState(
    seller.deliveryAvailable
  );

  const [editPickup, setEditPickup] = useState(seller.pickupAvailable);

  const [phoneOtpMode, setPhoneOtpMode] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");

  /* =========================================================
     OPEN PROFILE EDITOR
  ========================================================= */

  const openEditProfile = () => {
    setEditBusinessName(seller.businessName);
    setEditDescription(seller.description);
    setEditCategory(seller.category);
    setEditCity(seller.city);
    setEditLocality(seller.locality);
    setEditPhone(seller.phone);
    setEditWhatsapp(seller.whatsapp);
    setEditDelivery(seller.deliveryAvailable);
    setEditPickup(seller.pickupAvailable);

    setEditingProfile(true);
  };

  /* =========================================================
     SAVE PROFILE
  ========================================================= */

  const saveProfile = () => {
    setSeller({
      ...seller,
      businessName: editBusinessName.trim() || seller.businessName,
      description: editDescription.trim(),
      category: editCategory,
      city: editCity,
      locality: editLocality,
      phone: editPhone,
      whatsapp: editWhatsapp,
      deliveryAvailable: editDelivery,
      pickupAvailable: editPickup,
    });

    setEditingProfile(false);
    setPhoneOtpMode(false);
    setPhoneOtp("");

    alert("Business profile updated successfully.");
  };

  /* =========================================================
     AVAILABLE TODAY
  ========================================================= */

  const toggleAvailableToday = (id) => {
    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === id
          ? {
              ...product,
              availableToday: !product.availableToday,
            }
          : product
      )
    );
  };

  const availableProducts = products.filter(
    (product) => product.availableToday
  );

  /* =========================================================
     SHARED STYLES
  ========================================================= */

  const pageStyle = {
    minHeight: "100vh",
    background: "#FFF8EF",
    padding: "18px 16px 120px",
    fontFamily: "Arial, sans-serif",
    color: "#35142E",
  };

  const cardStyle = {
    background: "#FFFFFF",
    borderRadius: "22px",
    boxShadow: "0 6px 20px rgba(53,20,46,0.07)",
  };

  const primaryButton = {
    border: "none",
    background: "#5A1848",
    color: "#FFFFFF",
    borderRadius: "14px",
    padding: "13px 18px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  };

  const outlineButton = {
    border: "1px solid #5A1848",
    background: "#FFFFFF",
    color: "#5A1848",
    borderRadius: "14px",
    padding: "12px 17px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  };

  /* =========================================================
     BACK BUTTON
  ========================================================= */

  const BackButton = () => (
    <button
      onClick={() => {
        if (internalPage !== "dashboard") {
          setInternalPage("dashboard");
        } else {
          setPage("profile");
        }
      }}
      style={{
        border: "none",
        background: "transparent",
        padding: "4px 0",
        color: "#5A1848",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        marginBottom: "18px",
      }}
    >
      ← Back
    </button>
  );

  /* =========================================================
     AVAILABLE TODAY FULL PAGE
  ========================================================= */

  if (internalPage === "availableToday") {
    return (
      <div style={pageStyle}>
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
      marginBottom: "20px",
    }}
  >
    ← Back
  </button>

        <h1
          style={{
            margin: "0 0 6px",
            fontSize: "28px",
            color: "#35142E",
          }}
        >
          Available Today
        </h1>

        <p
          style={{
            margin: "0 0 22px",
            color: "#777",
            fontSize: "14px",
          }}
        >
          Choose which products customers can see as available today.
        </p>

        <div style={{ ...cardStyle, padding: "18px" }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "15px 4px",
                borderBottom: "1px solid #F0E7E4",
              }}
            >
              <input
                type="checkbox"
                checked={product.availableToday}
                onChange={() => toggleAvailableToday(product.id)}
                style={{
                  width: "20px",
                  height: "20px",
                  accentColor: "#5A1848",
                }}
              />

              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background: "#F7E8DC",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "28px",
                  flexShrink: 0,
                }}
              >
                {product.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "15px",
                    color: "#35142E",
                  }}
                >
                  {product.name}
                </div>

                <div
                  style={{
                    marginTop: "4px",
                    color: "#777",
                    fontSize: "13px",
                  }}
                >
                  ₹{product.price} · {product.stockStatus}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            alert("Available Today list saved.");
            setInternalPage("dashboard");
          }}
          style={{
            ...primaryButton,
            width: "100%",
            marginTop: "20px",
          }}
        >
          Save Changes
        </button>
      </div>
    );
  }

  /* =========================================================
     ALL PRODUCTS PAGE
  ========================================================= */

  if (internalPage === "allProducts") {
    return (
      <div style={pageStyle}>
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
      marginBottom: "20px",
    }}
  >
    ← Back
  </button>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                color: "#35142E",
              }}
            >
              Products
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color: "#777",
                fontSize: "14px",
              }}
            >
              {products.length} products
            </p>
          </div>

          <button
            onClick={() => setPage("selleraddproduct")}
            style={primaryButton}
          >
            ＋ Product
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                ...cardStyle,
                padding: "14px",
                display: "flex",
                gap: "14px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "16px",
                  background: `linear-gradient(135deg,${product.color1},${product.color2})`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "38px",
                  flexShrink: 0,
                }}
              >
                {product.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    margin: "0 0 5px",
                    fontSize: "16px",
                    color: "#35142E",
                  }}
                >
                  {product.name}
                </h3>

                <div
                  style={{
                    fontWeight: "700",
                    color: "#5A1848",
                    marginBottom: "5px",
                  }}
                >
                  ₹{product.price}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color:
                      product.stockStatus === "Out of Stock"
                        ? "#C94258"
                        : "#777",
                  }}
                >
                  {product.stockStatus}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "#999",
                    marginTop: "4px",
                  }}
                >
                  {product.views} views · {product.saves} saves
                </div>
              </div>

              <button
                onClick={() =>
                  alert(
                    `Edit ${product.name} - product editor coming next.`
                  )
                }
                style={{
                  border: "1px solid #5A1848",
                  background: "#FFF",
                  color: "#5A1848",
                  borderRadius: "11px",
                  padding: "9px 12px",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                ✏️ Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* =========================================================
     EDIT PROFILE PAGE
  ========================================================= */

  if (editingProfile) {
    return (
      <div style={pageStyle}>
        <button
          onClick={() => {
            setEditingProfile(false);
            setPhoneOtpMode(false);
          }}
          style={{
            border: "none",
            background: "transparent",
            padding: "4px 0",
            color: "#5A1848",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
            marginBottom: "18px",
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#35142E",
          }}
        >
          Edit Business Profile
        </h1>

        <p
          style={{
            margin: "7px 0 24px",
            color: "#777",
            fontSize: "14px",
          }}
        >
          Keep your business information up to date.
        </p>

        <div
          style={{
            ...cardStyle,
            padding: "20px",
          }}
        >
          <label style={labelStyle}>Business Logo</label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "22px",
            }}
          >
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: "#F7E8EF",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "38px",
              }}
            >
              {seller.logo}
            </div>

            <button
              style={outlineButton}
              onClick={() =>
                alert("Logo upload will connect to backend later.")
              }
            >
              Change Logo
            </button>
          </div>

          <label style={labelStyle}>Business Banner</label>

          <div
            style={{
              height: "120px",
              borderRadius: "18px",
              background: "linear-gradient(135deg,#8E4D6D,#EAB38E)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "55px",
              marginBottom: "22px",
            }}
          >
            {seller.bannerEmoji}
          </div>

          <button
            style={{
              ...outlineButton,
              marginBottom: "22px",
            }}
            onClick={() =>
              alert("Banner upload will connect to backend later.")
            }
          >
            Change Banner
          </button>

          <label style={labelStyle}>Business Name</label>

          <input
            value={editBusinessName}
            onChange={(e) => setEditBusinessName(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Category</label>

          <select
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            style={inputStyle}
          >
            <option>Desserts</option>
            <option>Fashion</option>
            <option>Jewellery</option>
            <option>Handmade</option>
            <option>Crochet</option>
            <option>Gifts</option>
          </select>

          <label style={labelStyle}>Description</label>

          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
            }}
          />

          <label style={labelStyle}>City</label>

          <input
            value={editCity}
            onChange={(e) => setEditCity(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Primary Locality</label>

          <input
            value={editLocality}
            onChange={(e) => setEditLocality(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Phone Number</label>

          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              style={{
                ...inputStyle,
                marginBottom: 0,
                flex: 1,
              }}
              disabled={phoneOtpMode}
            />

            <button
              onClick={() => {
                setPhoneOtpMode(true);
                setPhoneOtp("");
              }}
              style={{
                ...outlineButton,
                padding: "12px 13px",
                whiteSpace: "nowrap",
              }}
            >
              Change
            </button>
          </div>

          {phoneOtpMode && (
            <div
              style={{
                background: "#FFF8EF",
                borderRadius: "16px",
                padding: "15px",
                marginTop: "12px",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Enter the OTP sent to your new number.
              </p>

              <input
                value={phoneOtp}
                onChange={(e) => setPhoneOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength={4}
                style={inputStyle}
              />

              <button
                onClick={() => {
                  if (phoneOtp === "1234") {
                    setPhoneOtpMode(false);
                    alert("Phone number verified successfully.");
                  } else {
                    alert("For demo, use OTP 1234.");
                  }
                }}
                style={{
                  ...primaryButton,
                  width: "100%",
                }}
              >
                Verify OTP
              </button>
            </div>
          )}

          <label style={labelStyle}>WhatsApp Number</label>

          <input
            value={editWhatsapp}
            onChange={(e) => setEditWhatsapp(e.target.value)}
            style={inputStyle}
          />

          <label style={labelStyle}>Delivery</label>

          <div style={radioBox}>
            <label>
              <input
                type="radio"
                checked={editDelivery}
                onChange={() => setEditDelivery(true)}
              />
              Available
            </label>

            <label>
              <input
                type="radio"
                checked={!editDelivery}
                onChange={() => setEditDelivery(false)}
              />
              Unavailable
            </label>
          </div>

          <label style={labelStyle}>Pickup</label>

          <div style={radioBox}>
            <label>
              <input
                type="radio"
                checked={editPickup}
                onChange={() => setEditPickup(true)}
              />
              Available
            </label>

            <label>
              <input
                type="radio"
                checked={!editPickup}
                onChange={() => setEditPickup(false)}
              />
              Unavailable
            </label>
          </div>

          <button
            onClick={saveProfile}
            style={{
              ...primaryButton,
              width: "100%",
              marginTop: "12px",
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN SELLER DASHBOARD
  ========================================================= */

  return (
    <div style={pageStyle}>
      {/* BACK */}

      <button
        onClick={() => setPage("profile")}
        style={{
          border: "none",
          background: "transparent",
          padding: "4px 0",
          color: "#5A1848",
          fontSize: "16px",
          fontWeight: "700",
          cursor: "pointer",
          marginBottom: "18px",
        }}
      >
        ← Back
      </button>

      {/* =====================================================
          BUSINESS PROFILE
      ===================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: "hidden",
          marginBottom: "18px",
        }}
      >
        {/* BANNER */}

        <div
          style={{
            height: "170px",
            background:
              "linear-gradient(135deg,#8E4D6D 0%,#B97888 48%,#EAB38E 100%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "78px",
          }}
        >
          {seller.bannerEmoji}
        </div>

        {/* LOGO */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "-42px",
          }}
        >
          <div
            style={{
              width: "84px",
              height: "84px",
              borderRadius: "50%",
              background: "#FFFFFF",
              border: "4px solid #FFFFFF",
              boxShadow: "0 7px 20px rgba(0,0,0,.12)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "42px",
            }}
          >
            {seller.logo}
          </div>
        </div>

        {/* DETAILS */}

        <div
          style={{
            textAlign: "center",
            padding: "12px 20px 24px",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "27px",
              color: "#35142E",
            }}
          >
            {seller.businessName}
          </h1>

          <div
            style={{
              display: "inline-block",
              marginTop: "9px",
              padding: "7px 15px",
              background: "#FFE8F1",
              color: "#C23D71",
              borderRadius: "30px",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            {seller.category}
          </div>

          <div
            style={{
              marginTop: "13px",
              color: "#555",
              fontSize: "14px",
            }}
          >
            ⭐ 4.9
          </div>

          <div
            style={{
              marginTop: "7px",
              color: "#777",
              fontSize: "14px",
            }}
          >
            📍 {seller.locality}, {seller.city}
          </div>

          <p
            style={{
              margin: "15px auto 0",
              maxWidth: "650px",
              lineHeight: "24px",
              color: "#666",
              fontSize: "14px",
            }}
          >
            {seller.description}
          </p>

          {/* CONTACT NUMBERS */}

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            <div
              style={{
                background: "#F8F0F4",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#555",
              }}
            >
              📞 {seller.phone}
            </div>

            <div
              style={{
                background: "#F0F8F2",
                padding: "10px 14px",
                borderRadius: "12px",
                fontSize: "13px",
                color: "#555",
              }}
            >
              💬 {seller.whatsapp}
            </div>
          </div>

          <button
            onClick={openEditProfile}
            style={{
              ...outlineButton,
              marginTop: "17px",
            }}
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      {/* =====================================================
          DELIVERY / PICKUP
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: "19px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "31px" }}>🚚</div>

          <h3
            style={{
              margin: "9px 0 5px",
              fontSize: "16px",
            }}
          >
            Delivery
          </h3>

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "13px",
            }}
          >
            {seller.deliveryAvailable
              ? `Available · ${seller.deliveryCharge}`
              : "Unavailable"}
          </p>
        </div>

        <div
          style={{
            ...cardStyle,
            padding: "19px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "31px" }}>🏪</div>

          <h3
            style={{
              margin: "9px 0 5px",
              fontSize: "16px",
            }}
          >
            Pickup
          </h3>

          <p
            style={{
              margin: 0,
              color: "#777",
              fontSize: "13px",
            }}
          >
            {seller.pickupAvailable ? "Available" : "Unavailable"}
          </p>
        </div>
      </div>

      {/* =====================================================
          PROFILE STATS
      ===================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: "8px",
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          marginBottom: "18px",
        }}
      >
        <StatBox number={products.length} label="Products" />
        <StatBox number="8" label="Discover" />
        <StatBox number="18" label="Reviews" />
      </div>

      {/* =====================================================
          ANALYTICS
      ===================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <AnalyticsBox
          number="326"
          label="Total Views"
          icon="👁️"
        />

        <AnalyticsBox
          number="42"
          label="Total Contacts"
          subtitle="Calls + WhatsApp"
          icon="📞"
        />
      </div>

      {/* =====================================================
          AVAILABLE TODAY
      ===================================================== */}

      <section
        style={{
          ...cardStyle,
          padding: "20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
              }}
            >
              Available Today
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#777",
                fontSize: "13px",
              }}
            >
              Products currently visible as available today.
            </p>
          </div>

          <button
            onClick={() => setInternalPage("availableToday")}
            style={{
              ...outlineButton,
              padding: "10px 14px",
            }}
          >
            Manage
          </button>
        </div>

        <div style={{ marginTop: "16px" }}>
          {availableProducts.slice(0, 5).map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 0",
                borderBottom: "1px solid #F1E9E6",
              }}
            >
              <div
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  background: "#F7E8DC",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "24px",
                }}
              >
                {product.emoji}
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "14px",
                  }}
                >
                  {product.name}
                </div>

                <div
                  style={{
                    color: "#777",
                    fontSize: "12px",
                    marginTop: "3px",
                  }}
                >
                  ₹{product.price}
                </div>
              </div>
            </div>
          ))}

          {availableProducts.length > 5 && (
            <button
              onClick={() => setInternalPage("availableToday")}
              style={{
                border: "none",
                background: "transparent",
                color: "#5A1848",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                marginTop: "14px",
                padding: 0,
              }}
            >
              View All →
            </button>
          )}

          {availableProducts.length === 0 && (
            <p
              style={{
                color: "#999",
                fontSize: "14px",
                marginBottom: 0,
              }}
            >
              No products selected for today.
            </p>
          )}
        </div>
      </section>

      {/* =====================================================
          PRIMARY ACTIONS
      ===================================================== */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "22px",
        }}
      >
        <button
          onClick={() => setPage("selleraddproduct")}
          style={{
            ...primaryButton,
            flex: 1,
          }}
        >
          ＋ Product
        </button>

        <button
          onClick={() => setPage("selleraddvideo")}
          style={{
            ...outlineButton,
            flex: 1,
          }}
        >
          ＋ Video
        </button>
      </div>

      {/* =====================================================
          TABS
      ===================================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "35px",
          background: "white",
          borderRadius: "18px",
          padding: "6px",
          boxShadow: "0 6px 18px rgba(0,0,0,.06)",
        }}
      >
        <div
          onClick={() => setActiveTab("products")}
          style={{
            flex: 1,
            background:
              activeTab === "products"
                ? "#5A1848"
                : "transparent",
            color:
              activeTab === "products"
                ? "white"
                : "#666",
            padding: "12px",
            textAlign: "center",
            borderRadius: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Products
        </div>

        <div
          onClick={() => setActiveTab("discover")}
          style={{
            flex: 1,
            background:
              activeTab === "discover"
                ? "#5A1848"
                : "transparent",
            color:
              activeTab === "discover"
                ? "white"
                : "#666",
            padding: "12px",
            textAlign: "center",
            borderRadius: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Discover
        </div>

        <div
          onClick={() => setActiveTab("reviews")}
          style={{
            flex: 1,
            background:
              activeTab === "reviews"
                ? "#5A1848"
                : "transparent",
            color:
              activeTab === "reviews"
                ? "white"
                : "#666",
            padding: "12px",
            textAlign: "center",
            borderRadius: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Reviews
        </div>
      </div>

      {/* =====================================================
          PRODUCTS TAB
          SAME STYLE AS CUSTOMER
      ===================================================== */}

      {activeTab === "products" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "35px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#35142E",
              }}
            >
              Products
            </h2>

            <button
              onClick={() => setInternalPage("allProducts")}
              style={{
                border: "none",
                background: "none",
                color: "#5A1848",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              View All →
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2,1fr)",
              gap: "18px",
            }}
          >
            {products.slice(0, 4).map((product) => (
              <div key={product.id}>
                <ProductCard
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
  const productForPage = {
    ...product,

    // Product information
    about:
      product.about ||
      "Freshly made with quality ingredients and prepared by Sweet Crumbs.",

    // Seller information
    businessName: seller.businessName,
    businessPhone: seller.phone,
    businessWhatsapp: seller.whatsapp,
    businessEmoji: seller.logo,
    businessReviews: "18 Reviews",

    // Location
    location: `${seller.locality}, ${seller.city}`,

    // Delivery / pickup
    delivery: seller.deliveryAvailable
      ? `Seller Delivery Available${
          seller.deliveryCharge
            ? ` · ${seller.deliveryCharge}`
            : ""
        }`
      : "Delivery Unavailable",

    pickup: seller.pickupAvailable
      ? "Pickup Available"
      : "Pickup Unavailable",

    // Seller reference
    sellerId: seller.id || "seller_001",
  };

  setSelectedProduct(productForPage);
  setPreviousPage("sellerdashboard");
  setSellerMode(true);
  setPage("product");
}}
                />

              </div>
            ))}
          </div>
        </>
      )}

      {/* =====================================================
          DISCOVER TAB
          SAME STYLE AS CUSTOMER
      ===================================================== */}

      {activeTab === "discover" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "40px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#35142E",
              }}
            >
              Discover
            </h2>

            <button
              onClick={() => setPage("sellerposts")}
              style={{
                border: "none",
                background: "none",
                color: "#5A1848",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
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
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  minWidth: "210px",
                  position: "relative",
                }}
              >
                <ReelCard
                  reel={post}
                  business={post.business}
                  caption={post.caption}
                  emoji={post.emoji}
                  savedReels={savedReels}
                  setSavedReels={setSavedReels}
                  onClick={() => {
                    alert(
                      "Seller Discover preview. Full post management is available in Posts."
                    );
                  }}
                />

                <button
                  onClick={() =>
                    alert("Edit post coming next.")
                  }
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    border: "1px solid #5A1848",
                    background: "#FFFFFF",
                    color: "#5A1848",
                    borderRadius: "11px",
                    padding: "9px",
                    fontWeight: "700",
                    fontSize: "12px",
                    cursor: "pointer",
                  }}
                >
                  ✏️ Edit Post
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* =====================================================
          REVIEWS TAB
          PRODUCT REVIEWS ONLY
      ===================================================== */}

      {activeTab === "reviews" && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "40px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#35142E",
              }}
            >
              Reviews
            </h2>

            <button
              onClick={() => setPage("sellerreviews")}
              style={{
                border: "none",
                background: "none",
                color: "#5A1848",
                fontWeight: "600",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              View All →
            </button>
          </div>

          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "20px",
              boxShadow: "0 8px 18px rgba(0,0,0,.06)",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#35142E",
              }}
            >
              ⭐ 4.9
            </h2>

            <p
              style={{
                marginTop: "8px",
                color: "#777",
              }}
            >
              Based on 18 product reviews
            </p>

            <hr
              style={{
                margin: "20px 0",
                border: "1px solid #eee",
              }}
            />

            <div style={{ marginBottom: "10px" }}>
              ★★★★★ (12)
            </div>

            <div style={{ marginBottom: "10px" }}>
              ★★★★☆ (5)
            </div>

            <div style={{ marginBottom: "10px" }}>
              ★★★☆☆ (1)
            </div>

            <div style={{ marginBottom: "10px" }}>
              ★★☆☆☆ (0)
            </div>

            <div>★☆☆☆☆ (0)</div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
              marginTop: "24px",
            }}
          >
            {reviews.slice(0, 2).map((review, index) => (
              <div
                key={index}
                style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "18px",
                  boxShadow: "0 8px 18px rgba(0,0,0,.06)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px",
                    color: "#35142E",
                  }}
                >
                  {review.name}
                </h3>

                <p
                  style={{
                    margin: "0 0 6px",
                    color: "#555",
                  }}
                >
                  {"⭐".repeat(review.rating)}
                </p>

                <p
                  style={{
                    margin: "0 0 6px",
                    color: "#5A1848",
                    fontSize: "13px",
                    fontWeight: "600",
                  }}
                >
                  {review.product}
                </p>

                <p
                  style={{
                    margin: 0,
                    lineHeight: "26px",
                    color: "#666",
                  }}
                >
                  {review.review}
                </p>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#999",
                    fontSize: "12px",
                  }}
                >
                  {review.date}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatBox({ number, label }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "16px 5px",
      }}
    >
      <div
        style={{
          fontSize: "25px",
          fontWeight: "700",
          color: "#5A1848",
        }}
      >
        {number}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "12px",
          color: "#777",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function AnalyticsBox({
  number,
  label,
  subtitle,
  icon,
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "20px",
        boxShadow: "0 6px 20px rgba(53,20,46,0.07)",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "24px" }}>{icon}</div>

      <div
        style={{
          marginTop: "6px",
          fontSize: "27px",
          fontWeight: "700",
          color: "#35142E",
        }}
      >
        {number}
      </div>

      <div
        style={{
          marginTop: "4px",
          color: "#777",
          fontSize: "13px",
        }}
      >
        {label}
      </div>

      {subtitle && (
        <div
          style={{
            marginTop: "3px",
            color: "#999",
            fontSize: "11px",
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   FORM STYLES
========================================================= */

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "#35142E",
  marginBottom: "7px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #E5D8D4",
  borderRadius: "12px",
  padding: "13px",
  fontSize: "14px",
  outline: "none",
  marginBottom: "18px",
  background: "#FFFFFF",
  color: "#35142E",
};

const radioBox = {
  display: "flex",
  gap: "25px",
  background: "#FFF8EF",
  padding: "13px",
  borderRadius: "12px",
  marginBottom: "18px",
  fontSize: "13px",
};