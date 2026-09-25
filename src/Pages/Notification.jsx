import { listBusinesses } from "../services/businessService";
import { useAsync } from "../hooks/useAsync";

export default function Notification({
  setPage,
  setSelectedBusiness,
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
  // Keep these IDs the same as the IDs used in Offers.jsx

  const offers = [
    {
      id: 1,
      business: "ABC Bakery",
      title: "Independence Day Offer",
      discount: "15% OFF",
      description: "On all products",
      code: "TIBU15",
      validTill: "15 August",
    },

    {
      id: 2,
      business: "Handmade by Sara",
      title: "Rakhi Special",
      discount: "₹100 OFF",
      description: "On purchases above ₹799",
      code: "TIBUSARA100",
      validTill: "20 August",
    },
  ];

  // ================= NOTIFICATIONS =================

  const notifications = [
    {
      id: 1,
      type: "business",
      icon: "🎉",
      title: "New Business Near You",
      message: "Pearl Bloom just joined Tibu — 800 m away.",
      time: "10 min ago",
      businessId: "pearl-bloom",
    },

    {
      id: 2,
      type: "business",
      icon: "🎉",
      title: "New Business Near You",
      message: "Aura Candles just joined Tibu — 1.1 km away.",
      time: "35 min ago",
      businessId: "aura-candles",
    },

    {
      id: 3,
      type: "business",
      icon: "🎉",
      title: "New Business Near You",
      message: "Crochet by Sarah just joined Tibu — 1.4 km away.",
      time: "2 hrs ago",
      businessId: "crochet-by-sarah",
    },

    {
      id: 4,
      type: "business",
      icon: "🎉",
      title: "New Business Near You",
      message: "Gift Studio just joined Tibu — 1.8 km away.",
      time: "Today",
      businessId: "gift-studio",
    },

    {
      id: 5,
      type: "offer",
      icon: "🏷️",
      title: "Offer Near You",
      message: "ABC Bakery has 15% OFF — 1.1 km away.",
      time: "Today",
      offerId: 1,
    },

    {
      id: 6,
      type: "offer",
      icon: "🏷️",
      title: "Offer Near You",
      message: "Handmade by Sara has ₹100 OFF — 1.8 km away.",
      time: "Today",
      offerId: 2,
    },
  ];

  // ================= VIEW BUSINESS =================

  const handleBusiness = (item) => {
    if (!item.businessId) return;

    const business = allBusinesses.find(
      (business) => business.id === item.businessId
    );

    if (business) {
      setSelectedBusiness(business);
      setPage("business");
    } else {
      console.log("Business not found:", item.businessId);
    }
  };

  // ================= VIEW OFFER =================

  const handleOffer = (item) => {
    if (!item.offerId) return;

    const offer = offers.find(
      (offer) => offer.id === item.offerId
    );

    if (offer) {
      setSelectedOffer(offer);
      setPage("offers");
    } else {
      console.log("Offer not found:", item.offerId);
    }
  };

  // ================= RETURN =================

  return (
    <div
      style={{
        padding: "35px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >

      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "32px",
              color: "#35142E",
            }}
          >
            🔔 Notifications
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "#777",
            }}
          >
            Discover what's new and relevant near you.
          </p>
        </div>
      </div>

      {/* ================= NOTIFICATION FEED ================= */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >

        {notifications.map((item) => (

          <div
            key={item.id}
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 8px 22px rgba(0,0,0,.08)",

              display: "flex",
              gap: "16px",
              alignItems: "flex-start",

              borderLeft:
                item.type === "business"
                  ? "6px solid #F7B5C8"
                  : "6px solid #F4C542",
            }}
          >

            {/* ================= ICON ================= */}

            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",

                background:
                  item.type === "business"
                    ? "#FFF1F5"
                    : "#FFFBE8",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                fontSize: "24px",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>

            {/* ================= CONTENT ================= */}

            <div
              style={{
                flex: 1,
              }}
            >

              {/* TITLE + TIME */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "15px",
                }}
              >

                <h3
                  style={{
                    margin: 0,
                    color: "#35142E",
                    fontSize: "18px",
                  }}
                >
                  {item.title}
                </h3>

                <span
                  style={{
                    fontSize: "13px",
                    color: "#999",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.time}
                </span>

              </div>

              {/* MESSAGE */}

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#666",
                  lineHeight: "24px",
                }}
              >
                {item.message}
              </p>

              {/* ================= ACTION ================= */}

              <div
                style={{
                  marginTop: "18px",
                }}
              >

                <button
                  onClick={() => {
                    if (item.type === "business") {
                      handleBusiness(item);
                    }

                    if (item.type === "offer") {
                      handleOffer(item);
                    }
                  }}
                  style={{
                    border: "none",
                    background: "#5A1848",
                    color: "white",
                    padding: "10px 18px",
                    borderRadius: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {item.type === "business"
                    ? "View Business →"
                    : "View Offer →"}
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}