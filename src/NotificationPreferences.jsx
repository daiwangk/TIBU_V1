
const Toggle = ({ enabled, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: "48px",
      height: "26px",
      borderRadius: "20px",
      background: enabled ? "#5A1848" : "#E0E0E0",
      position: "relative",
      border: "none",
      cursor: "pointer",
      transition: "background 0.3s ease",
    }}
  >
    <div
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        background: "white",
        position: "absolute",
        top: "3px",
        left: enabled ? "25px" : "3px",
        transition: "left 0.3s ease",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    />
  </button>
);

const SettingRow = ({ title, description, enabled, onClick }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 0",
      borderBottom: "1px solid #F1E5ED",
    }}
  >
    <div style={{ flex: 1, paddingRight: "15px" }}>
      <h3
        style={{
          margin: 0,
          color: "#35142E",
          fontSize: "17px",
          fontWeight: "600",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "6px 0 0",
          color: "#777",
          fontSize: "14px",
          lineHeight: "20px",
        }}
      >
        {description}
      </p>
    </div>
    <Toggle enabled={enabled} onClick={onClick} />
  </div>
);

import { useState } from "react";

export default function NotificationPreferences({ setPage }) {
  const [pushNotifications, setPushNotifications] = useState(false);
  const [offersNotifications, setOffersNotifications] = useState(false);
  const [businessNotifications, setBusinessNotifications] = useState(false);

  

  

  return (
    <div
      style={{
        background: "#FFF8EF",
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: "20px",
        paddingBottom: "40px",
        fontFamily: "Arial",
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
  Notification Preferences
</h1>

<p
  style={{
    color: "#777",
    marginBottom: "30px",
  }}
>
  Manage the notifications you want to receive from Tibu.
</p>
      {/* SETTINGS */}

      <div
        style={{
          width: "100%",
          background: "white",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <SettingRow
          title="Push Notifications"
          description="Receive notifications about businesses, offers and updates."
          enabled={pushNotifications}
          onClick={() =>
            setPushNotifications(!pushNotifications)
          }
        />

        <SettingRow
          title="Offers & Discounts"
          description="Get notified about offers from businesses near you."
          enabled={offersNotifications}
          onClick={() =>
            setOffersNotifications(!offersNotifications)
          }
        />

        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontWeight: "700",
                color: "#35142E",
                fontSize: "16px",
              }}
            >
              New Businesses
            </div>

            <div
              style={{
                marginTop: "6px",
                color: "#777",
                fontSize: "13px",
                lineHeight: "19px",
              }}
            >
              Discover newly joined businesses around you.
            </div>
          </div>

          <Toggle
            enabled={businessNotifications}
            onClick={() =>
              setBusinessNotifications(!businessNotifications)
            }
          />
        </div>
      </div>

      {/* STATUS */}

      <div
        style={{
          maxWidth: "700px",
          margin: "18px auto 0",
          textAlign: "center",
          color: "#888",
          fontSize: "13px",
        }}
      >
        {pushNotifications ||
        offersNotifications ||
        businessNotifications
          ? "Selected notifications are turned on."
          : "All notifications are currently turned off."}
      </div>
    </div>
  );
}