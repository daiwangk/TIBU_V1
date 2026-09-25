export default function OfferDetails({
  offer,
  onBack,
  onViewBusiness,
}) {
  if (!offer) {
    return null;
  }

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
          onClick={onBack}
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

      {/* MAIN CARD */}

      <div
        style={{
          background: "white",
          borderRadius: "20px",
          padding: "30px",
          boxShadow: "0 8px 18px rgba(0,0,0,.05)",
          maxWidth: "700px",
        }}
      >

        {/* BUSINESS */}

        <div
          style={{
            color: "#777",
            fontSize: "14px",
            fontWeight: "600",
            marginBottom: "8px",
          }}
        >
          {offer.business}
        </div>

        {/* OFFER TITLE */}

        <h1
          style={{
            margin: 0,
            color: "#35142E",
            fontSize: "28px",
          }}
        >
          {offer.title}
        </h1>

        {/* DISCOUNT */}

        <div
          style={{
            marginTop: "22px",
            color: "#5A1848",
            fontSize: "38px",
            fontWeight: "800",
          }}
        >
          {offer.discount}
        </div>

        {/* CONDITION */}

        <div
          style={{
            marginTop: "6px",
            color: "#666",
            fontSize: "16px",
          }}
        >
          {offer.description}
        </div>

        {/* OFFER CODE */}

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#F7EFF4",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              color: "#777",
              fontSize: "13px",
              marginBottom: "6px",
            }}
          >
            Tibu Offer Code
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong
              style={{
                color: "#5A1848",
                fontSize: "20px",
                letterSpacing: "1px",
              }}
            >
              {offer.code}
            </strong>

            <button
              onClick={() =>
                navigator.clipboard?.writeText(offer.code)
              }
              style={{
                border: "none",
                background: "white",
                color: "#5A1848",
                padding: "7px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Copy
            </button>
          </div>
        </div>

        {/* HOW TO REDEEM */}

        <div
          style={{
            marginTop: "28px",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "#35142E",
            }}
          >
            How to redeem
          </h3>

          <div
            style={{
              marginTop: "12px",
              color: "#666",
              lineHeight: "23px",
              fontSize: "14px",
            }}
          >
            <div>
              <strong>
                1. Contact {offer.business} through Tibu.
              </strong>
            </div>

            <div>
              <strong>
                2. Share the offer code{" "}
                `{offer.code}`
              </strong>{" "}
              with the seller.
            </div>

            <div>
              <strong>
                3. The seller verifies the code.
              </strong>
            </div>

            <div>
              <strong>
                4. The discount is applied to your purchase.
              </strong>
            </div>
          </div>
        </div>

        {/* VALIDITY */}

        <div
          style={{
            marginTop: "20px",
            color: "#888",
            fontSize: "14px",
          }}
        >
          Valid till {offer.validTill}
        </div>

        {/* VIEW BUSINESS */}

        <button
          onClick={onViewBusiness}
          style={{
            width: "100%",
            marginTop: "24px",
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            background: "#5A1848",
            color: "white",
            fontWeight: "700",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          View Business →
        </button>

        {/* CONTACT BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "12px",
          }}
        >

          <button
            style={{
              flex: 1,
              padding: "14px",
              border: "1px solid #5A1848",
              borderRadius: "12px",
              background: "white",
              color: "#5A1848",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            WhatsApp Business
          </button>

          <button
            style={{
              flex: 1,
              padding: "14px",
              border: "1px solid #5A1848",
              borderRadius: "12px",
              background: "white",
              color: "#5A1848",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Call Business
          </button>

        </div>

      </div>
    </div>
  );
}