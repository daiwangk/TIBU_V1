
export default function TermsConditions({ setPage }) {
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
          margin: "0 0 8px",
          fontSize: "30px",
          color: "#35142E",
        }}
      >
        📄 Terms & Conditions
      </h1>

      <p
        style={{
          marginTop: 0,
          marginBottom: "28px",
          color: "#777",
          lineHeight: "1.6",
        }}
      >
        Please read these terms before using Tibu.
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

        <h2 style={{ color: "#35142E", marginTop: 0 }}>
          1. About Tibu
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu is a platform that helps customers discover homegrown
          businesses, products, services and other local offerings.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu provides information and connects customers with businesses.
          Tibu does not directly own or manufacture the products listed by
          independent businesses unless specifically stated.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          2. Using Tibu
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          You agree to use Tibu only for lawful purposes and in a way that
          does not harm other users, businesses or the platform.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          3. Business Information
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Businesses may provide information such as their name, location,
          contact details, products, prices, photos and availability.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          While we may try to keep information useful and up to date,
          businesses are responsible for the accuracy of the information
          they provide.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          4. Products & Services
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Product descriptions, prices, availability and other details may
          change. Customers should confirm important details directly with
          the business before making a purchase or visiting.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          5. Contacting Businesses
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu may provide options such as calling or messaging a business.
          When you choose to contact a business, your interaction may take
          place directly with that business.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu is not responsible for conversations, agreements, payments
          or transactions that take place directly between customers and
          businesses, except where Tibu explicitly provides the service.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          6. Reviews & User Content
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          If Tibu allows users to submit reviews, feedback, photos or other
          content, you are responsible for ensuring that the content you
          submit is truthful, lawful and does not violate the rights of
          others.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          7. Availability of Tibu
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          We aim to keep Tibu available and working properly, but we cannot
          guarantee that the platform will always be available, error-free
          or uninterrupted.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          8. Changes to Tibu
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          We may update, change or discontinue features of Tibu when
          necessary. We may also update these Terms & Conditions from time
          to time.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          9. Your Account
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          You are responsible for keeping your account information accurate
          and for using your account appropriately.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          10. Contact Us
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
            marginBottom: 0,
          }}
        >
          If you have questions about these Terms & Conditions, contact Tibu
          through Help & Feedback.
        </p>

      </div>
    </div>
  );
}