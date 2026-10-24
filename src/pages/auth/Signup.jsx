import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserPlus,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    if (formData.password.length < 8) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password
      );

      if (result.session) {
        navigate("/");
      } else {
        navigate("/login", {
          state: {
            message: t("auth.checkEmailConfirmation", {
              defaultValue:
                "Account created successfully. Please check your email to confirm your account before signing in.",
            }),
          },
        });
      }
    } catch (err) {
      const message = err.message || "";
      if (
        message.includes("already registered") ||
        message.includes("already in use") ||
        message.includes("User already registered")
      ) {
        setError(
          t("auth.emailAlreadyRegistered", {
            defaultValue: "This email is already registered.",
          })
        );
      } else if (message.includes("Password should be")) {
        setError(
          t("auth.passwordTooShort", {
            defaultValue: "Password must be at least 8 characters.",
          })
        );
      } else {
        setError(
          message ||
            t("auth.signupFailed", {
              defaultValue: "Unable to create account. Please try again.",
            })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-brand">
          <div className="auth-logo">E</div>
          <h1>{t("auth.systemName")}</h1>
          <p>{t("auth.systemDescription")}</p>
        </div>

        <div className="auth-card">

          <h2>{t("auth.signUpTitle")}</h2>

          <p className="auth-subtitle">
            {t("auth.signUpSubtitle")}
          </p>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="signup-name">{t("auth.fullName")}</label>

              <div className="input-wrapper">
                <FaUser />

                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">{t("auth.emailAddress")}</label>

              <div className="input-wrapper">
                <FaEnvelope />

                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">{t("auth.password")}</label>

              <div className="input-wrapper">
                <FaLock />

                <input
                  id="signup-password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder={t("auth.createPasswordPlaceholder")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-confirm-password">{t("auth.confirmPassword")}</label>

              <div className="input-wrapper">
                <FaLock />

                <input
                  id="signup-confirm-password"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="auth-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><span className="button-spinner" />{t("auth.signingUp")}</> : <><FaUserPlus />{t("auth.createAccount")}</>}
            </button>

          </form>

          <div className="auth-divider">
            <span>{t("auth.or")}</span>
          </div>

          <p className="auth-footer">
            {t("auth.alreadyHaveAccount")} {" "}
            <Link to="/login">
              {t("auth.signIn")}
            </Link>
          </p>

        </div>

      </div>
    </div>
  );
}

export default Signup;
