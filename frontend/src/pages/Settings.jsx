import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await api.put("/auth/profile", { name });
      setUser(data.user);
      setName(data.user.name);
      setMessage("Profile updated.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Update failed.");
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const { data } = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      setMessage(data.message);
      setCurrentPassword("");
      setNewPassword("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Password update failed.");
    }
  };

  const signOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h1>Settings</h1>
          <p>Manage your profile and workspace preferences.</p>
        </div>
      </div>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message" role="alert">{error}</div>}
      <div className="settings-grid">
        <section className="panel settings-card">
          <h2>Profile information</h2>
          <p>Update the name associated with your account.</p>
          <form onSubmit={updateProfile}>
            <label>
              Full name
              <input value={name} onChange={(event) => setName(event.target.value)} required minLength="2" maxLength="80" />
            </label>
            <label>
              Email address
              <input value={user?.email || ""} disabled />
            </label>
            <button className="btn btn-primary">Save profile</button>
          </form>
        </section>
        <section className="panel settings-card">
          <h2>Appearance</h2>
          <p>Choose the look that feels right for your workspace.</p>
          <div className="theme-choice">
            <span>
              {darkMode ? "Dark mode" : "Light mode"}
              <small>{darkMode ? "Easy on the eyes" : "Bright and clear"}</small>
            </span>
            <button className="btn btn-ghost" onClick={toggleTheme}>
              Switch to {darkMode ? "light" : "dark"}
            </button>
          </div>
        </section>
        <section className="panel settings-card">
          <h2>Change password</h2>
          <p>Use at least 8 characters for your new password.</p>
          <form onSubmit={updatePassword}>
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength="8"
                maxLength="72"
                required
              />
            </label>
            <button className="btn btn-primary">Update password</button>
          </form>
        </section>
        <section className="panel settings-card">
          <h2>Account</h2>
          <p>Signed in as {user?.email}</p>
          <button className="btn btn-danger" onClick={signOut}>Sign out</button>
        </section>
      </div>
    </>
  );
}
