import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowRight, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaSignInAlt } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const savedEmail = localStorage.getItem("erp_remembered_email");
    if (savedEmail) { setFormData((current) => ({ ...current, email: savedEmail })); setRememberMe(true); }
  }, []);

  const handleChange = (event) => { setFormData((current) => ({ ...current, [event.target.name]: event.target.value })); setError(""); };
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try {
      await login(formData.email, formData.password);
      if (rememberMe) localStorage.setItem("erp_remembered_email", formData.email.trim());
      else localStorage.removeItem("erp_remembered_email");
      navigate("/");
    } catch (err) { setError(err.message || "Unable to sign in. Please try again."); } finally { setIsSubmitting(false); }
  };

  return <div className="auth-page"><div className="auth-shell">
    <aside className="auth-showcase"><div className="auth-showcase-logo">E</div><p className="auth-kicker">ERP SYSTEM</p><h1>{t("auth.businessConfidence")}</h1><p>{t("auth.workspaceDescription")}</p><div className="auth-showcase-points"><span>✓ {t("auth.secureAccess")}</span><span>✓ {t("auth.realTimeInsights")}</span><span>✓ {t("auth.builtForTeam")}</span></div></aside>
    <main className="auth-container"><div className="auth-mobile-brand"><div className="auth-logo">E</div><span>ERP System</span></div><div className="auth-card">
      <div className="auth-card-heading"><p className="auth-kicker">{t("auth.welcome")}</p><h2>{t("auth.signInTitle")}</h2><p className="auth-subtitle">{t("auth.signInSubtitle")}</p></div>
      {error && <div className="auth-error" role="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label htmlFor="login-email">{t("auth.emailAddress")}</label><div className="input-wrapper"><FaEnvelope /><input id="login-email" type="email" name="email" autoComplete="email" placeholder={t("auth.emailPlaceholder")} value={formData.email} onChange={handleChange} required /></div></div>
        <div className="form-group"><div className="label-row"><label htmlFor="login-password">{t("auth.password")}</label><Link to="/forgot-password" className="forgot-password">{t("auth.forgotPassword")}</Link></div><div className="input-wrapper"><FaLock /><input id="login-password" type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder={t("auth.passwordPlaceholder")} value={formData.password} onChange={handleChange} required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div></div>
        <label className="remember-me"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> {t("auth.rememberEmail")}</label>
        <button className="auth-button" type="submit" disabled={isSubmitting}>{isSubmitting ? <><span className="button-spinner" />{t("auth.signingIn")}</> : <><FaSignInAlt />{t("auth.signIn")}<FaArrowRight className="button-arrow" /></>}</button>
      </form>
      <p className="auth-footer">{t("auth.newToSystem")} <Link to="/signup">{t("auth.createAccount")}</Link></p>
    </div></main>
  </div></div>;
}

export default Login;
