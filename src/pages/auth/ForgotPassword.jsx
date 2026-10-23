import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCheck, FaEnvelope, FaEye, FaEyeSlash, FaKey, FaLock } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { authApi } from "../../services/api";
import AuthLanguageToggle from "../../components/auth/AuthLanguageToggle";

function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [developmentCode, setDevelopmentCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordScore = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;
  const strengthLabels = ["useEight", "addUppercase", "addNumber", "strongPassword"];

  const requestCode = async (event) => {
    event.preventDefault(); setError(""); setIsSubmitting(true);
    try { const response = await authApi.forgotPassword(email); setDevelopmentCode(response.developmentCode || ""); setMessage(response.message); setStep(2); }
    catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
  };
  const resetPassword = async (event) => {
    event.preventDefault(); setError("");
    if (password !== confirmPassword) return setError(t("auth.passwordsNoMatch"));
    setIsSubmitting(true);
    try { const response = await authApi.resetPassword(email, code, password); setMessage(response.message); setStep(3); setTimeout(() => navigate("/login"), 1800); }
    catch (err) { setError(err.message); } finally { setIsSubmitting(false); }
  };

  return <div className="auth-page"><div className="auth-shell auth-shell-compact">
    <aside className="auth-showcase"><div className="auth-showcase-logo">E</div><p className="auth-kicker">{t("auth.accountSecurity")}</p><h1>{t("auth.secureRecovery")}</h1><p>{t("auth.recoveryDescription")}</p><div className="auth-showcase-points"><span>✓ {t("auth.oneTimeVerification")}</span><span>✓ {t("auth.passwordProtection")}</span></div></aside>
    <main className="auth-container"><AuthLanguageToggle /><div className="auth-mobile-brand"><div className="auth-logo">E</div><span>ERP System</span></div><div className="auth-card">
      <Link to="/login" className="back-link"><FaArrowLeft /> {t("auth.backToLogin")}</Link>
      <div className="reset-steps"><span className={step >= 1 ? "active" : ""}>1</span><i className={step >= 2 ? "active" : ""} /><span className={step >= 2 ? "active" : ""}>2</span><i className={step >= 3 ? "active" : ""} /><span className={step >= 3 ? "active" : ""}>3</span></div>
      {step === 1 && <><div className="auth-card-heading"><p className="auth-kicker">{t("auth.recovery")}</p><h2>{t("auth.forgotTitle")}</h2><p className="auth-subtitle">{t("auth.forgotSubtitle")}</p></div>{error && <div className="auth-error" role="alert">{error}</div>}<form onSubmit={requestCode}><div className="form-group"><label htmlFor="reset-email">{t("auth.emailAddress")}</label><div className="input-wrapper"><FaEnvelope /><input id="reset-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("auth.emailPlaceholder")} required /></div></div><button className="auth-button" disabled={isSubmitting}>{isSubmitting ? <><span className="button-spinner" />{t("auth.sendingCode")}</> : t("auth.continue")}</button></form></>}
      {step === 2 && <><div className="auth-card-heading"><p className="auth-kicker">{t("auth.verifyReset")}</p><h2>{t("auth.newPasswordTitle")}</h2><p className="auth-subtitle">{t("auth.codeSent")} <strong>{email}</strong>.</p></div>{error && <div className="auth-error" role="alert">{error}</div>}{developmentCode && <div className="auth-code">{t("auth.localCode")} <strong>{developmentCode}</strong></div>}<form onSubmit={resetPassword}><div className="form-group"><label htmlFor="reset-code">{t("auth.verificationCode")}</label><div className="input-wrapper"><FaKey /><input id="reset-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder={t("auth.codePlaceholder")} required /></div></div><div className="form-group"><label htmlFor="new-password">{t("auth.newPassword")}</label><div className="input-wrapper"><FaLock /><input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("auth.newPasswordPlaceholder")} minLength="8" required /><button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button></div><div className="password-strength"><span className={`strength-${passwordScore}`} /><small>{t(`auth.${strengthLabels[passwordScore]}`)}</small></div></div><div className="form-group"><label htmlFor="confirm-password">{t("auth.confirmNewPassword")}</label><div className="input-wrapper"><FaLock /><input id="confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder={t("auth.repeatNewPassword")} minLength="8" required /></div></div><button className="auth-button" disabled={isSubmitting}>{isSubmitting ? <><span className="button-spinner" />{t("auth.updating")}</> : t("auth.resetPassword")}</button></form></>}
      {step === 3 && <div className="reset-complete"><div><FaCheck /></div><h2>{t("auth.passwordUpdated")}</h2><p>{message} {t("auth.redirecting")}</p></div>}
    </div></main>
  </div></div>;
}

export default ForgotPassword;
