
export default function PrivacySecurity({ setPage }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF7F9",
        padding: "40px",
        boxSizing: "border-box",
        paddingBottom: "40px",
      }}
    >
      {/* Back Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
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
        🔒 Privacy & Security
      </h1>

      <p
        style={{
          color: "#777",
          marginBottom: "30px",
          lineHeight: "1.6",
        }}
      >
        Your privacy matters to us.
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
          👤 Information We Collect
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          When you use Tibu, we may collect information such as:
        </p>

        <ul style={{ color: "#666", lineHeight: "1.8", paddingLeft: "22px" }}>
          <li>Your name</li>
          <li>Username</li>
          <li>Phone number</li>
          <li>Profile photo</li>
          <li>Saved businesses, products and reels</li>
          <li>Addresses you choose to save</li>
          <li>Information you provide while using Tibu</li>
        </ul>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          🔐 How We Use Your Information
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          We use your information to:
        </p>

        <ul style={{ color: "#666", lineHeight: "1.8", paddingLeft: "22px" }}>
          <li>Create and manage your Tibu account</li>
          <li>Personalize your experience</li>
          <li>Save your preferences and saved items</li>
          <li>Help you connect with businesses</li>
          <li>Provide support when you contact us</li>
          <li>Improve Tibu and its features</li>
        </ul>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          📞 Your Phone Number
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Your phone number is used for your account and relevant Tibu
          services.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Your phone number is not publicly displayed on your profile or
          automatically shared with businesses.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          When you choose to call or contact a business, the relevant contact
          information may be used to complete that action.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          🏪 Business Information
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu may display information provided by businesses, such as
          business names, locations, contact details, products, prices,
          photos, availability and other business information.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Businesses are responsible for the accuracy of the information they
          provide.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          🛡️ Keeping Your Information Safe
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          We take reasonable steps to protect your personal information from
          unauthorized access, misuse or disclosure. However, no online
          service can guarantee complete security.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          🤝 Information Sharing
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Tibu does not sell your personal information.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          Information may be shared when it is necessary to provide a service
          you have requested, operate Tibu, comply with legal requirements,
          or protect the safety and security of users and the platform.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          🗑️ Your Information
        </h2>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          You can review and update the information in your profile through
          Edit Profile.
        </p>

        <p style={{ color: "#666", lineHeight: "1.7" }}>
          If you want your account or personal information deleted, you can
          contact Tibu through Help & Feedback.
        </p>

        <h2 style={{ color: "#35142E", marginTop: "30px" }}>
          📩 Questions About Privacy?
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
            marginBottom: 0,
          }}
        >
          If you have a privacy or security concern, contact Tibu through
          Help & Feedback.
        </p>
      </div>
    </div>
  );
}