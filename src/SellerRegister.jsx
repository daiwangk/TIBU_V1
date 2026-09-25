import { useState } from "react";

function SellerRegistration({ setPage }) {
  const [step, setStep] = useState(1);

  // STEP 1 — Seller account
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // STEP 2 — Contact permissions
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsappOtp, setWhatsappOtp] = useState("");
  const [whatsappOtpSent, setWhatsappOtpSent] = useState(false);
  const [whatsappVerified, setWhatsappVerified] = useState(false);

  const [allowCalls, setAllowCalls] = useState(true);
  const [allowWhatsApp, setAllowWhatsApp] = useState(true);

  // STEP 3 — Business profile
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [logo, setLogo] = useState(null);
  const [banner, setBanner] = useState(null);

  const [city, setCity] = useState("Mumbai");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");

  // NEW — Service radius
  const [serviceRadius, setServiceRadius] = useState("5");

  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);

  const [profileCreated, setProfileCreated] = useState(false);

  const mumbaiLocalities = [
    "Bandra West",
    "Bandra East",
    "Khar West",
    "Khar East",
    "Santacruz West",
    "Santacruz East",
    "Juhu",
    "Vile Parle West",
    "Vile Parle East",
    "Andheri West",
    "Andheri East",
    "Lokhandwala",
    "Versova",
    "Goregaon West",
    "Goregaon East",
    "Malad West",
    "Malad East",
    "Powai",
    "Lower Parel",
    "Worli",
    "Dadar",
    "Matunga",
    "Chembur",
    "Kurla",
    "Ghatkopar",
    "Other",
  ];

  const categories = [
    "Desserts",
    "Fashion",
    "Jewellery",
    "Crochet",
    "Handmade",
    "Gifts",
  ];

  const radiusOptions = [
    "1",
    "2",
    "3",
    "5",
    "7",
    "10",
    "15",
    "20",
  ];

  // -----------------------------
  // STEP 1
  // -----------------------------

  const sendOtp = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    setOtpSent(true);
    alert("Demo OTP sent: 1234");
  };

  const verifyPhone = () => {
    if (otp === "1234") {
      setPhoneVerified(true);
      setStep(2);
    } else {
      alert("For demo, please enter OTP 1234.");
    }
  };

  // -----------------------------
  // STEP 2
  // -----------------------------

  const sendWhatsappOtp = () => {
    if (!whatsapp.trim()) {
      alert("Please enter your WhatsApp number.");
      return;
    }

    setWhatsappOtpSent(true);
    alert("Demo WhatsApp OTP sent: 1234");
  };

  const verifyWhatsapp = () => {
    if (whatsappOtp === "1234") {
      setWhatsappVerified(true);
    } else {
      alert("For demo, please enter OTP 1234.");
    }
  };

  const continueFromContactSettings = () => {
    if (allowWhatsApp && !whatsappVerified) {
      alert("Please verify your WhatsApp number or turn off WhatsApp permission.");
      return;
    }

    if (!allowCalls && !allowWhatsApp) {
      alert("Please allow at least one customer contact method.");
      return;
    }

    setStep(3);
  };

  // -----------------------------
  // STEP 3
  // -----------------------------

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setLogo(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setBanner(URL.createObjectURL(file));
    }
  };

  const createProfile = () => {
    if (!businessName.trim()) {
      alert("Please enter your business name.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    if (!locality) {
      alert("Please select your locality.");
      return;
    }

    if (!address.trim()) {
      alert("Please enter your business address.");
      return;
    }

    setProfileCreated(true);
    setStep(4);
  };

  // -----------------------------
  // STYLES
  // -----------------------------

  const pageStyle = {
    minHeight: "100vh",
    background: "#FFF8EF",
    padding: "24px",
    paddingBottom: "150px",
    boxSizing: "border-box",
  };

  const containerStyle = {
    maxWidth: "620px",
    margin: "0 auto",
  };

  const cardStyle = {
    background: "#FFFFFF",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(53,20,46,0.08)",
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #DDD",
    borderRadius: "10px",
    fontSize: "15px",
    boxSizing: "border-box",
    marginTop: "7px",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#35142E",
    marginTop: "18px",
  };

  const buttonStyle = {
    width: "100%",
    border: "none",
    borderRadius: "12px",
    padding: "14px",
    background: "#5A1848",
    color: "#FFFFFF",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "22px",
  };

  const secondaryButtonStyle = {
    width: "100%",
    border: "1px solid #5A1848",
    borderRadius: "12px",
    padding: "13px",
    background: "#FFFFFF",
    color: "#5A1848",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "12px",
  };

  const sectionTitleStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#35142E",
    marginBottom: "5px",
  };

  const smallTextStyle = {
    fontSize: "13px",
    color: "#777",
    lineHeight: "1.5",
  };

  // -----------------------------
  // RENDER
  // -----------------------------

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setPage("profile")}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              color: "#5A1848",
              fontSize: "15px",
            }}
          >
            ← Back
          </button>

          <h1
            style={{
              color: "#35142E",
              margin: "18px 0 5px",
              fontSize: "28px",
            }}
          >
            Become a Seller
          </h1>

          <p style={{ ...smallTextStyle, margin: 0 }}>
            Create your homegrown business profile on Tibu.
          </p>
        </div>

        {/* PROGRESS */}
        <div
          style={{
            display: "flex",
            gap: "7px",
            marginBottom: "20px",
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              style={{
                height: "5px",
                flex: 1,
                borderRadius: "10px",
                background:
                  item <= step ? "#5A1848" : "#E6D8DF",
              }}
            />
          ))}
        </div>

        {/* ===================== */}
        {/* STEP 1 */}
        {/* ===================== */}

        {step === 1 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              1. Create your seller account
            </div>

            <p style={smallTextStyle}>
              Your phone number will be verified before you can create
              your business profile.
            </p>

            <label style={labelStyle}>
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Phone Number
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                type="tel"
                style={inputStyle}
              />
            </label>

            {!otpSent && !phoneVerified && (
              <button style={buttonStyle} onClick={sendOtp}>
                Send OTP
              </button>
            )}

            {otpSent && !phoneVerified && (
              <>
                <label style={labelStyle}>
                  Enter OTP
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    inputMode="numeric"
                    style={inputStyle}
                  />
                </label>

                <button
                  style={buttonStyle}
                  onClick={verifyPhone}
                >
                  Verify Phone
                </button>
              </>
            )}

            {phoneVerified && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#EAF7EE",
                  color: "#287A45",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                ✓ Phone number verified
              </div>
            )}
          </div>
        )}

        {/* ===================== */}
        {/* STEP 2 */}
        {/* ===================== */}

        {step === 2 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              2. Contact settings
            </div>

            <p style={smallTextStyle}>
              Choose how customers can contact you. These permissions
              will be visible to customers on your business profile.
            </p>

            <label style={labelStyle}>
              WhatsApp Number
              <input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Enter WhatsApp number"
                type="tel"
                style={inputStyle}
              />
            </label>

            {!whatsappVerified && !whatsappOtpSent && (
              <button
                style={secondaryButtonStyle}
                onClick={sendWhatsappOtp}
              >
                Verify WhatsApp Number
              </button>
            )}

            {whatsappOtpSent && !whatsappVerified && (
              <>
                <label style={labelStyle}>
                  WhatsApp OTP
                  <input
                    value={whatsappOtp}
                    onChange={(e) =>
                      setWhatsappOtp(e.target.value)
                    }
                    placeholder="Enter OTP"
                    maxLength={4}
                    inputMode="numeric"
                    style={inputStyle}
                  />
                </label>

                <button
                  style={secondaryButtonStyle}
                  onClick={verifyWhatsapp}
                >
                  Verify WhatsApp
                </button>
              </>
            )}

            {whatsappVerified && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#EAF7EE",
                  color: "#287A45",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                ✓ WhatsApp number verified
              </div>
            )}

            {/* CALL PERMISSION */}
            <div
              style={{
                marginTop: "25px",
                padding: "15px",
                borderRadius: "12px",
                background: "#F8F1F5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#35142E",
                  }}
                >
                  Allow customer calls
                </div>

                <div style={smallTextStyle}>
                  Customers can call your business.
                </div>
              </div>

              <input
                type="checkbox"
                checked={allowCalls}
                onChange={(e) =>
                  setAllowCalls(e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </div>

            {/* WHATSAPP PERMISSION */}
            <div
              style={{
                marginTop: "12px",
                padding: "15px",
                borderRadius: "12px",
                background: "#F8F1F5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#35142E",
                  }}
                >
                  Allow WhatsApp messages
                </div>

                <div style={smallTextStyle}>
                  Customers can contact your business on WhatsApp.
                </div>
              </div>

              <input
                type="checkbox"
                checked={allowWhatsApp}
                onChange={(e) =>
                  setAllowWhatsApp(e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </div>

            <button
              style={buttonStyle}
              onClick={continueFromContactSettings}
            >
              Continue
            </button>
          </div>
        )}

        {/* ===================== */}
        {/* STEP 3 */}
        {/* ===================== */}

        {step === 3 && (
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>
              3. Create your business profile
            </div>

            <p style={smallTextStyle}>
              Tell customers about your homegrown business.
            </p>

            <label style={labelStyle}>
              Business Name
              <input
                value={businessName}
                onChange={(e) =>
                  setBusinessName(e.target.value)
                }
                placeholder="e.g. Laiba's Bakes"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Business Description
              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Tell customers about your business..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </label>

            <label style={labelStyle}>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            {/* LOGO */}
            <label style={labelStyle}>
              Business Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{
                  ...inputStyle,
                  padding: "10px",
                }}
              />
            </label>

            {logo && (
              <img
                src={logo}
                alt="Business logo preview"
                style={{
                  width: "90px",
                  height: "90px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  marginTop: "12px",
                }}
              />
            )}

            {/* BANNER */}
            <label style={labelStyle}>
              Business Banner
              <input
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                style={{
                  ...inputStyle,
                  padding: "10px",
                }}
              />
            </label>

            {banner && (
              <img
                src={banner}
                alt="Business banner preview"
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "12px",
                  marginTop: "12px",
                }}
              />
            )}

            {/* LOCATION */}
            <div
              style={{
                marginTop: "28px",
                paddingTop: "22px",
                borderTop: "1px solid #EEE",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  color: "#35142E",
                  marginBottom: "3px",
                }}
              >
                Business Location
              </div>

              <p style={smallTextStyle}>
                Customers will see your locality. Your exact address
                can be used for pickup and service matching.
              </p>
            </div>

            <label style={labelStyle}>
              City
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={inputStyle}
              >
                <option value="Mumbai">Mumbai</option>
              </select>
            </label>

            <label style={labelStyle}>
              Primary Locality
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                style={inputStyle}
              >
                <option value="">Select locality</option>

                {mumbaiLocalities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              Business / Pickup Address
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
                rows={3}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                }}
              />
            </label>

            {/* ========================= */}
            {/* SERVICE RADIUS — NEW */}
            {/* ========================= */}

            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                borderRadius: "14px",
                background: "#F8F1F5",
              }}
            >
              <div
                style={{
                  fontWeight: "700",
                  color: "#35142E",
                  fontSize: "15px",
                }}
              >
                📍 Service Radius
              </div>

              <p
                style={{
                  ...smallTextStyle,
                  marginTop: "6px",
                  marginBottom: "12px",
                }}
              >
                How far from your business are you willing to serve
                customers?
              </p>

              <select
                value={serviceRadius}
                onChange={(e) =>
                  setServiceRadius(e.target.value)
                }
                style={{
                  ...inputStyle,
                  marginTop: 0,
                  background: "#FFFFFF",
                }}
              >
                {radiusOptions.map((radius) => (
                  <option key={radius} value={radius}>
                    {radius} km
                  </option>
                ))}
              </select>

              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  color: "#777",
                  lineHeight: "1.5",
                }}
              >
                Example: If you select 5 km, Tibu can use this radius
                to determine which nearby customers can discover or
                contact your business.
              </div>
            </div>

            {/* DELIVERY */}
            <div
              style={{
                marginTop: "22px",
                padding: "15px",
                borderRadius: "12px",
                background: "#F8F1F5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#35142E",
                  }}
                >
                  Delivery Available
                </div>

                <div style={smallTextStyle}>
                  Customers can request delivery.
                </div>
              </div>

              <input
                type="checkbox"
                checked={deliveryAvailable}
                onChange={(e) =>
                  setDeliveryAvailable(e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </div>

            {/* PICKUP */}
            <div
              style={{
                marginTop: "12px",
                padding: "15px",
                borderRadius: "12px",
                background: "#F8F1F5",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#35142E",
                  }}
                >
                  Pickup Available
                </div>

                <div style={smallTextStyle}>
                  Customers can collect orders from your location.
                </div>
              </div>

              <input
                type="checkbox"
                checked={pickupAvailable}
                onChange={(e) =>
                  setPickupAvailable(e.target.checked)
                }
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </div>

            <button
              style={buttonStyle}
              onClick={createProfile}
            >
              Create Business Profile
            </button>
          </div>
        )}

        {/* ===================== */}
        {/* STEP 4 */}
        {/* ===================== */}

        {step === 4 && profileCreated && (
          <div style={cardStyle}>
            <div
              style={{
                textAlign: "center",
                fontSize: "48px",
                marginBottom: "10px",
              }}
            >
              🎉
            </div>

            <h2
              style={{
                textAlign: "center",
                color: "#35142E",
                marginBottom: "8px",
              }}
            >
              Your business profile is ready!
            </h2>

            <p
              style={{
                ...smallTextStyle,
                textAlign: "center",
              }}
            >
              Here's how your basic business information looks.
            </p>

            {banner && (
              <img
                src={banner}
                alt="Business banner"
                style={{
                  width: "100%",
                  height: "170px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  marginTop: "18px",
                }}
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginTop: "18px",
              }}
            >
              {logo ? (
                <img
                  src={logo}
                  alt="Business logo"
                  style={{
                    width: "70px",
                    height: "70px",
                    objectFit: "cover",
                    borderRadius: "50%",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    borderRadius: "50%",
                    background: "#F6DCE8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  🏪
                </div>
              )}

              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#35142E",
                  }}
                >
                  {businessName}
                </h3>

                <div
                  style={{
                    color: "#777",
                    fontSize: "13px",
                    marginTop: "4px",
                  }}
                >
                  {category}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                background: "#F8F1F5",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  color: "#35142E",
                  fontWeight: "600",
                  marginBottom: "8px",
                }}
              >
                📍 {locality}, {city}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                Serves customers within{" "}
                <strong>{serviceRadius} km</strong>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#555",
                  marginBottom: "8px",
                }}
              >
                🚚 Delivery:{" "}
                <strong>
                  {deliveryAvailable
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>

              <div
                style={{
                  fontSize: "14px",
                  color: "#555",
                }}
              >
                🛍️ Pickup:{" "}
                <strong>
                  {pickupAvailable
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>
            </div>

            {description && (
              <p
                style={{
                  marginTop: "18px",
                  color: "#555",
                  lineHeight: "1.6",
                  fontSize: "14px",
                }}
              >
                {description}
              </p>
            )}

            <button
              style={buttonStyle}
              onClick={() => setPage("sellerdashboard")}
            >
              Go to Seller Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SellerRegistration;