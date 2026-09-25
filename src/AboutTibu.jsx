
export default function AboutTibu({ setPage }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF8EF",
        padding: "24px",
        boxSizing: "border-box",
        color: "#35142E",
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
          margin: "0 0 10px",
          fontSize: "30px",
          color: "#35142E",
        }}
      >
        ℹ️ About Tibu
      </h1>

      <p
        style={{
          marginTop: 0,
          marginBottom: "28px",
          color: "#777",
          lineHeight: "1.6",
          fontSize: "16px",
        }}
      >
        Homegrown businesses are everywhere. It’s time to find them.
      </p>

      {/* CONTENT */}
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,.06)",
          textAlign: "left",
        }}
      >

        <h2
          style={{
            color: "#35142E",
            marginTop: 0,
          }}
        >
          Homegrown businesses are everywhere.
        </h2>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          Established businesses have stores & showrooms that put them in
          front of customers.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          But millions of homegrown businesses are creating products —
          from homes, kitchens, studios and workshops.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          They are creating products people genuinely want, building brands
          around their ideas, and growing their own customers and communities.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          Without an offline presence, they often sell through social media
          content, WhatsApp forwards, recommendations from friends, word of
          mouth, or simply through people who already know the person behind
          the business.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          To reach new customers, they have to keep creating content,
          promoting their pages and finding ways to bring people to them.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          At the same time, customers scroll through social media to find
          products they like — but finding trusted sellers, checking nearby
          availability, understanding the price and figuring out how to
          connect can quickly become a task.
        </p>

        {/* TIBU */}
        <div
          style={{
            marginTop: "30px",
            padding: "22px",
            borderRadius: "18px",
            background: "#F8F0F5",
          }}
        >
          <h2
            style={{
              color: "#35142E",
              marginTop: 0,
              marginBottom: "10px",
            }}
          >
            That’s where Tibu comes in.
          </h2>

          <h3
            style={{
              color: "#35142E",
              marginBottom: 0,
              fontSize: "21px",
            }}
          >
            Discover what’s homegrown.
          </h3>
        </div>

        <h2
          style={{
            color: "#35142E",
            marginTop: "32px",
          }}
        >
          A place to discover homegrown businesses.
        </h2>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          Tibu is a discovery marketplace for homegrown businesses —
          bringing independent creators, local brands and businesses into
          one place.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          Instead of finding them one Instagram page, WhatsApp message or
          recommendation at a time, Tibu gives people a simpler way to
          discover businesses, explore what they offer and connect with them
          directly.
        </p>

        <p style={{ color: "#666", lineHeight: "1.8" }}>
          Tibu gives homegrown businesses a place to be found beyond the
          audience they’ve built themselves, while helping customers find
          businesses they might never have come across otherwise.
        </p>

        {/* FINAL LINE */}
        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: "1px solid #EEE",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#35142E",
              fontWeight: "700",
              fontSize: "18px",
              marginBottom: "10px",
            }}
          >
            Discover. Explore. Connect.
          </p>

          <p
            style={{
              color: "#777",
              lineHeight: "1.7",
              marginBottom: 0,
            }}
          >
            No complicated middleman.
            <br />
            No need to become a huge brand.
            <br />
            Just homegrown businesses, made easier to find.
          </p>
        </div>

      </div>
    </div>
  );
}