import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Zap } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Auth({ mode }) {
  const isRegister = mode === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const change = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate("/dashboard");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Unable to connect. Check that the backend is running."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="auth-back"><ArrowLeft size={16} /> Back to home</Link>
      <div className="auth-card">
        <Link to="/" className="brand auth-brand">
          <span className="brand-icon"><Zap size={20} /></span>TASKORA
        </Link>
        <span className="eyebrow">{isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}</span>
        <h1>{isRegister ? "Create your account" : "Good to see you."}</h1>
        <p>{isRegister ? "A clearer day starts with a better plan." : "Sign in and pick up where you left off."}</p>
        <form onSubmit={submit}>
          {isRegister && (
            <label>
              Full name
              <input
                name="name"
                value={form.name}
                onChange={change}
                placeholder="Your name"
                required
                minLength="2"
                maxLength="80"
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={change}
              placeholder="you@example.com"
              required
              maxLength="254"
            />
          </label>
          <label>
            Password
            <div className="password-wrap">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={change}
                placeholder="At least 8 characters"
                required
                minLength="8"
                maxLength="72"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          {error && <div className="error-message" role="alert">{error}</div>}
          <button className="btn btn-primary auth-submit" disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>
        <div className="auth-switch">
          {isRegister ? "Already have an account?" : "New to TASKORA?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </div>
        <small className="secure-note">Your account is protected with encrypted password storage.</small>
      </div>
    </div>
  );
}
