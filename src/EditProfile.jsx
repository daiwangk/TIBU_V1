import { useState } from "react";

export default function EditProfile({
  setPage,
  profile,
  setProfile,
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username);
  const [phone, setPhone] = useState(profile.phone || "");
  const [avatar] = useState(profile.avatar);
const [avatarFile, setAvatarFile] = useState(profile.avatarFile || null);

  const [previewImage, setPreviewImage] = useState(
    profile.avatarUrl || null
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setPreviewImage(imageUrl);

    // Keep file separately for future backend upload
    setAvatarFile(file);
  };

const handleSave = () => {
  const updatedProfile = {
    ...profile,
    fullName: fullName.trim(),
    username: username.trim().replace(/^@+/, ""),
    phone: phone.trim(),
    avatar,
    avatarUrl: previewImage,
    avatarFile,
  };

  setProfile(updatedProfile);
  setPage("profile");
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF7F9",
        padding: "40px",
        paddingBottom: "140px",
        boxSizing: "border-box",
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

      {/* ================= HEADER ================= */}

<h1
  style={{
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "32px",
    color: "#35142E",
  }}
>
  ✏️ Edit Profile
</h1>

<p
  style={{
    color: "#777",
    marginBottom: "35px",
  }}
>
  Update your profile information.
</p>

      {/* FORM CARD */}

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "30px",
          boxShadow: "0 10px 25px rgba(0,0,0,.06)",
        }}
      >

        {/* PROFILE PHOTO */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >

          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "50%",
              background: "#F4E8EF",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              fontSize: "48px",
            }}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              profile.avatar || "👩"
            )}
          </div>

          <label
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "#F4E8EF",
              color: "#5A1848",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Change Photo

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                display: "none",
              }}
            />
          </label>

        </div>

        {/* FULL NAME */}

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#35142E",
            fontWeight: "600",
          }}
        >
          Full Name
        </label>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "1px solid #DDD",
            boxSizing: "border-box",
            fontSize: "15px",
            marginBottom: "20px",
            outline: "none",
          }}
        />

        {/* USERNAME */}

        <label
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#35142E",
            fontWeight: "600",
          }}
        >
          Username
        </label>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #DDD",
            borderRadius: "12px",
            marginBottom: "30px",
          }}
        >
          <span
            style={{
              paddingLeft: "14px",
              color: "#777",
              fontWeight: "600",
            }}
          >
            @
          </span>

          <input
            type="text"
            value={username}
            onChange={(e) =>
  setUsername(e.target.value.replace(/^@+/, ""))
}
            placeholder="username"
            style={{
              flex: 1,
              padding: "14px 10px",
              border: "none",
              outline: "none",
              fontSize: "15px",
            }}
          />
        </div>
{/* PHONE NUMBER */}

<label
  style={{
    display: "block",
    marginBottom: "8px",
    color: "#35142E",
    fontWeight: "600",
  }}
>
  Phone Number
</label>

<input
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="Enter your phone number"
  style={{
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #DDD",
    boxSizing: "border-box",
    fontSize: "15px",
    marginBottom: "30px",
    outline: "none",
  }}
/>
        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "12px",
          }}
        >

          <button
            onClick={() => setPage("profile")}
            style={{
              flex: 1,
              padding: "14px",
              border: "1px solid #DDD",
              borderRadius: "14px",
              background: "white",
              color: "#555",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "14px",
              border: "none",
              borderRadius: "14px",
              background: "#5A1848",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save Changes
          </button>

        </div>

      </div>
    </div>
  );
}