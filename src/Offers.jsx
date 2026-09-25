import { listBusinesses } from "./services/businessService";
import { useAsync } from "./hooks/useAsync";
import OfferDetails from "./OfferDetails";


export default function Offers({
  setPage,
  setSelectedBusiness,
  selectedOffer,
  setSelectedOffer,
}) {
  const { data: candleBusinesses = [], loading: load_candleBusinesses } = useAsync(() => listBusinesses('candle'));
  const { data: crochetBusinesses = [], loading: load_crochetBusinesses } = useAsync(() => listBusinesses('crochet'));
  const { data: dessertBusinesses = [], loading: load_dessertBusinesses } = useAsync(() => listBusinesses('desert'));
  const { data: embroideryBusinesses = [], loading: load_embroideryBusinesses } = useAsync(() => listBusinesses('embroidery'));
  const { data: giftsBusinesses = [], loading: load_giftsBusinesses } = useAsync(() => listBusinesses('gifts'));
  const { data: jewelleryBusinesses = [], loading: load_jewelleryBusinesses } = useAsync(() => listBusinesses('jewellery'));
  const { data: menFashionBusinesses = [], loading: load_menFashionBusinesses } = useAsync(() => listBusinesses('men-fashion'));
  const { data: resinBusinesses = [], loading: load_resinBusinesses } = useAsync(() => listBusinesses('rein'));
  const { data: womenFashionBusinesses = [], loading: load_womenFashionBusinesses } = useAsync(() => listBusinesses('women-fashion'));
  if (load_candleBusinesses || load_crochetBusinesses || load_dessertBusinesses || load_embroideryBusinesses || load_giftsBusinesses || load_jewelleryBusinesses || load_menFashionBusinesses || load_resinBusinesses || load_womenFashionBusinesses) return <div style={{padding: "40px", textAlign: "center"}}>Loading...</div>;

  // ================= ALL BUSINESSES =================

  const allBusinesses = [
    ...dessertBusinesses,
    ...jewelleryBusinesses,
    ...crochetBusinesses,
    ...resinBusinesses,
    ...candleBusinesses,
    ...embroideryBusinesses,
    ...giftsBusinesses,
    ...menFashionBusinesses,
    ...womenFashionBusinesses,
  ];

 // ================= OFFERS =================

const offers = [
  {
    id: 1,

    // Connects the offer to the real business record
    businessId: "pearl-bloom",

    business: "Pearl Bloom",
    title: "Independence Day Offer",
    discount: "15% OFF",
    description: "On all products",
    code: "TIBU15",
    validTill: "15 August",
  },

  {
    id: 2,

    // Connects the offer to the real business record
    businessId: "gift-studio",

    business: "Gift Studio",
    title: "Rakhi Special",
    discount: "₹100 OFF",
    description: "On purchases above ₹799",
    code: "TIBUSARA100",
    validTill: "20 August",
  },
];

// ================= VIEW BUSINESS =================

const handleBusiness = (offer) => {
  const business = allBusinesses.find(
    (b) => b.id === offer.businessId
  );

  if (!business) {
    console.log(
      "Business not found:",
      offer.businessId
    );
    return;
  }

  setSelectedBusiness(business);
  setPage("business");
};

// ================= VIEW OFFER =================

const handleOffer = (offer) => {
  setSelectedOffer(offer);
};

// ================= OFFER DETAILS =================

if (selectedOffer) {
  return (
    <OfferDetails
      offer={selectedOffer}
      onBack={() => setSelectedOffer(null)}
      onViewBusiness={() =>
        handleBusiness(selectedOffer)
      }
    />
  );
}

// ================= OFFERS PAGE =================

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

      {/* HEADER */}

      <h1
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "32px",
          color: "#35142E",
        }}
      >
        💜 Tibu Offers
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "30px",
        }}
      >
        Exclusive deals from businesses on Tibu.
      </p>

      {/* OFFERS */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >

        {offers.map((offer) => (
          <div
            key={offer.id}
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 8px 18px rgba(0,0,0,.05)",
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

            {/* TITLE */}

            <h2
              style={{
                margin: 0,
                color: "#35142E",
                fontSize: "21px",
              }}
            >
              {offer.title}
            </h2>

            {/* DISCOUNT */}

            <div
              style={{
                marginTop: "16px",
                color: "#5A1848",
                fontSize: "28px",
                fontWeight: "800",
              }}
            >
              {offer.discount}
            </div>

            {/* DESCRIPTION */}

            <div
              style={{
                marginTop: "5px",
                color: "#666",
                fontSize: "15px",
              }}
            >
              {offer.description}
            </div>

            {/* CODE */}

            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                background: "#F7EFF4",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#777",
                  fontSize: "13px",
                }}
              >
                Tibu Offer Code
              </span>

              <strong
                style={{
                  color: "#5A1848",
                  letterSpacing: "1px",
                }}
              >
                {offer.code}
              </strong>
            </div>

            {/* VALIDITY */}

            <div
              style={{
                marginTop: "14px",
                color: "#888",
                fontSize: "13px",
              }}
            >
              Valid till {offer.validTill}
            </div>

            {/* VIEW OFFER */}

            <button
              onClick={() => handleOffer(offer)}
              style={{
                width: "100%",
                marginTop: "18px",
                padding: "13px",
                border: "none",
                borderRadius: "12px",
                background: "#5A1848",
                color: "white",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              View Offer →
            </button>

          </div>
        ))}

      </div>
    </div>
  );
}