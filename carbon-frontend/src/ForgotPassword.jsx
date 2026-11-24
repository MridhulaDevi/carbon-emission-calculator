import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Leaf,
  RefreshCw,
  AlertCircle,
  LoaderCircle
} from "lucide-react";

import LanguageSwitcher from "./LanguageSwitcher";
import "./ForgotPassword.css";

const API = "http://localhost:8080/api/auth";

function ForgotPassword({ onBack }) {

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [countdown, setCountdown] = useState(0);

  useEffect(() => {

    if (countdown <= 0) return;

    const timer = setTimeout(() => {

      setCountdown(previous => previous - 1);

    }, 1000);

    return () => clearTimeout(timer);

  }, [countdown]);

  const request = async (endpoint, body) => {

    const response = await fetch(`${API}/${endpoint}`, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(body)

    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {

      throw new Error(
        data.message || "Something went wrong. Please try again."
      );

    }

    return data;
  };

  const sendOtp = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {

      const data = await request("forgot-password", {

        email: email.trim()

      });

      setEmail(email.trim());
      setMessage(data.message);
      setOtp("");
      setResetToken("");
      setCountdown(60);
      setStep(2);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  const resendOtp = async () => {

    if (countdown > 0 || loading) return;

    setError("");
    setMessage("");
    setLoading(true);

    try {

      const data = await request("forgot-password", {

        email: email.trim()

      });

      setMessage(data.message);
      setOtp("");
      setCountdown(60);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  const verifyOtp = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {

      setError("Please enter the complete 6-digit code.");
      return;

    }

    setLoading(true);

    try {

      const data = await request("verify-otp", {

        email,
        otp

      });

      setResetToken(data.resetToken);
      setMessage("Email verified successfully.");
      setStep(3);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  const resetPassword = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 6) {

      setError("Password must contain at least 6 characters.");
      return;

    }

    if (newPassword !== confirmPassword) {

      setError("Passwords do not match.");
      return;

    }

    setLoading(true);

    try {

      await request("reset-password", {

        email,
        resetToken,
        newPassword,
        confirmPassword

      });

      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setStep(4);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };

  const restartRecovery = () => {

    setStep(1);
    setOtp("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");

  };

  const stepTitles = [
    "Email",
    "Verification",
    "New password"
  ];

  return (

    <div className="fp-page">

      <div className="fp-language">

        <LanguageSwitcher />

      </div>

      <section className="fp-visual">

        <div className="fp-decoration fp-circle-one" />
        <div className="fp-decoration fp-circle-two" />
        <div className="fp-decoration fp-circle-three" />

        <div className="fp-brand">

          <div className="fp-brand-icon">
            <Leaf size={25} />
          </div>

          <span>CarbonDown</span>

        </div>

        <div className="fp-visual-content">

          <div className="fp-visual-icon">

            <ShieldCheck size={58} strokeWidth={1.3} />

          </div>

          <p className="fp-eyebrow">

            YOUR JOURNEY CONTINUES

          </p>

          <h1>

            A fresh start.<br />

            <span>A greener future.</span>

          </h1>

          <p className="fp-visual-description">

            Securely recover your account and continue
            your journey towards a more sustainable tomorrow.

          </p>

          <div className="fp-security-label">

            <ShieldCheck size={18} />

            Secure email verification

          </div>

        </div>

        <div className="fp-visual-footer">

          Small steps today. A greener tomorrow.

        </div>

      </section>

      <section className="fp-main">

        <button
          className="fp-back"
          onClick={onBack}
          disabled={loading}
        >

          <ArrowLeft size={17} />

          Back to Sign In

        </button>

        <div className="fp-card" key={step}>

          {step !== 4 && (

            <div className="fp-progress">

              {stepTitles.map((title, index) => (

                <div
                  key={title}
                  className={`fp-progress-item ${
                    step === index + 1 ? "active" : ""
                  } ${
                    step > index + 1 ? "completed" : ""
                  }`}
                >

                  <div className="fp-progress-number">

                    {step > index + 1
                      ? <CheckCircle2 size={17} />
                      : index + 1}

                  </div>

                  <span>{title}</span>

                </div>

              ))}

            </div>

          )}

          {error && (

            <div className="fp-alert fp-error">

              <AlertCircle size={18} />

              <span>{error}</span>

            </div>

          )}

          {message && (

            <div className="fp-alert fp-success">

              <CheckCircle2 size={18} />

              <span>{message}</span>

            </div>

          )}

          {step === 1 && (

            <>

              <div className="fp-icon">

                <Mail size={29} />

              </div>

              <p className="fp-label">

                ACCOUNT RECOVERY

              </p>

              <h2>Forgot your password?</h2>

              <p className="fp-description">

                Enter your registered email address.
                We'll send you a verification code to
                securely reset your password.

              </p>

              <form onSubmit={sendOtp}>

                <label>Email address</label>

                <div className="fp-input">

                  <Mail size={19} />

                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />

                </div>

                <button
                  type="submit"
                  className="fp-primary"
                  disabled={loading}
                >

                  {loading ? (

                    <>

                      <LoaderCircle className="fp-spinner" size={19} />

                      Sending verification code...

                    </>

                  ) : (

                    <>

                      Send verification code

                      <ArrowRight size={19} />

                    </>

                  )}

                </button>

              </form>

            </>

          )}

          {step === 2 && (

            <>

              <div className="fp-icon">

                <ShieldCheck size={30} />

              </div>

              <p className="fp-label">

                EMAIL VERIFICATION

              </p>

              <h2>Check your inbox</h2>

              <p className="fp-description">

                Enter the 6-digit verification code sent to

              </p>

              <div className="fp-email-display">

                <Mail size={16} />

                {email}

              </div>

              <form onSubmit={verifyOtp}>

                <label>Verification code</label>

                <input
                  className="fp-otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={e =>
                    setOtp(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  required
                  disabled={loading}
                />

                <p className="fp-expiry">

                  Your verification code expires in 5 minutes.

                </p>

                <button
                  type="submit"
                  className="fp-primary"
                  disabled={loading || otp.length !== 6}
                >

                  {loading ? (

                    <>

                      <LoaderCircle className="fp-spinner" size={19} />

                      Verifying...

                    </>

                  ) : (

                    <>

                      Verify code

                      <ArrowRight size={19} />

                    </>

                  )}

                </button>

              </form>

              <div className="fp-resend">

                <span>Didn't receive the code?</span>

                <button
                  onClick={resendOtp}
                  disabled={countdown > 0 || loading}
                >

                  <RefreshCw size={15} />

                  {countdown > 0
                    ? `Resend in ${countdown}s`
                    : "Resend code"}

                </button>

              </div>

              <button
                className="fp-text-button"
                onClick={restartRecovery}
                disabled={loading}
              >

                Change email address

              </button>

            </>

          )}

          {step === 3 && (

            <>

              <div className="fp-icon">

                <LockKeyhole size={29} />

              </div>

              <p className="fp-label">

                SECURE YOUR ACCOUNT

              </p>

              <h2>Create a new password</h2>

              <p className="fp-description">

                Your email has been verified.
                Choose a new password for your account.

              </p>

              <form onSubmit={resetPassword}>

                <label>New password</label>

                <div className="fp-input">

                  <LockKeyhole size={18} />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="fp-eye"
                    aria-label="Toggle new password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                  >

                    {showPassword
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}

                  </button>

                </div>

                <label>Confirm password</label>

                <div className="fp-input">

                  <LockKeyhole size={18} />

                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="fp-eye"
                    aria-label="Toggle confirm password visibility"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >

                    {showConfirm
                      ? <EyeOff size={18} />
                      : <Eye size={18} />}

                  </button>

                </div>

                <div className="fp-password-rules">

                  <div className={
                    newPassword.length >= 6 ? "valid" : ""
                  }>

                    <CheckCircle2 size={15} />

                    At least 6 characters

                  </div>

                  <div className={
                    newPassword &&
                    newPassword === confirmPassword
                      ? "valid"
                      : ""
                  }>

                    <CheckCircle2 size={15} />

                    Passwords match

                  </div>

                </div>

                <button
                  type="submit"
                  className="fp-primary"
                  disabled={loading}
                >

                  {loading ? (

                    <>

                      <LoaderCircle className="fp-spinner" size={19} />

                      Updating password...

                    </>

                  ) : (

                    <>

                      Reset password

                      <ArrowRight size={19} />

                    </>

                  )}

                </button>

              </form>

              <button
                className="fp-text-button"
                onClick={restartRecovery}
                disabled={loading}
              >

                Restart verification

              </button>

            </>

          )}

          {step === 4 && (

            <div className="fp-complete">

              <div className="fp-complete-icon">

                <CheckCircle2 size={58} strokeWidth={1.5} />

              </div>

              <p className="fp-label">

                ALL SET

              </p>

              <h2>Password reset successful!</h2>

              <p className="fp-description">

                Your password has been updated successfully.
                You can now sign in using your new password
                and continue your sustainability journey.

              </p>

              <button
                className="fp-primary"
                onClick={onBack}
              >

                Continue to Sign In

                <ArrowRight size={19} />

              </button>

            </div>

          )}

          <div className="fp-footer">

            <ShieldCheck size={15} />

            Your account security matters to us.

          </div>

        </div>

      </section>

    </div>

  );
}

export default ForgotPassword;