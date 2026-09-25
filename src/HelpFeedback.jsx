import { useState } from "react";

export default function HelpFeedback({ setPage }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!message.trim()) {
      alert("Please enter your message.");
      return;
    }

    // Backend/email submission can be connected later
    setSubmitted(true);
    setMessage("");
  };

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
        💬 Help & Feedback
      </h1>

      <p
        style={{
          marginTop: 0,
          marginBottom: "28px",
          color: "#777",
          lineHeight: "1.6",
        }}
      >
        Need help, want to report a problem, or have a suggestion?
        We're here to listen.
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

        {/* GET HELP */}
        <h2
          style={{
            color: "#35142E",
            marginTop: 0,
            marginBottom: "12px",
          }}
        >
          🆘 Get Help
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
          }}
        >
          If you're having trouble using Tibu or need help with your
          account, saved items, businesses, products, or any other
          feature, let us know.
        </p>

        {/* REPORT A PROBLEM */}
        <h2
          style={{
            color: "#35142E",
            marginTop: "30px",
            marginBottom: "12px",
          }}
        >
          ⚠️ Report a Problem
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
          }}
        >
          Found something that isn't working correctly? Tell us what
          happened so we can look into it.
        </p>

        {/* COMPLAINTS */}
        <h2
          style={{
            color: "#35142E",
            marginTop: "30px",
            marginBottom: "12px",
          }}
        >
          📢 Complaints & Suggestions
        </h2>

        <p
          style={{
            color: "#666",
            lineHeight: "1.7",
          }}
        >
          Your feedback helps us improve Tibu. You can share a
          complaint, suggestion, feature request, or anything you'd
          like us to know.
        </p>

        {/* MESSAGE BOX */}
        <h2
          style={{
            color: "#35142E",
            marginTop: "30px",
            marginBottom: "12px",
          }}
        >
          ✍️ Send Us a Message
        </h2>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your complaint, suggestion, question, or feedback..."
          rows={6}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "14px",
            border: "1px solid #DDD",
            boxSizing: "border-box",
            fontSize: "15px",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "15px",
            border: "none",
            borderRadius: "14px",
            background: "#35142E",
            color: "white",
            fontSize: "15px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Send Message
        </button>

        {submitted && (
          <p
            style={{
              marginTop: "16px",
              marginBottom: 0,
              color: "#4A7C59",
              fontWeight: "600",
              lineHeight: "1.6",
            }}
          >
            ✓ Thank you for your feedback. We've received your message.
          </p>
        )}

      </div>
    </div>
  );
}