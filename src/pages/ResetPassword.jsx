import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";

function ResetPassword() {
  const { backendUrl } = useContext(AppContext);
  axios.defaults.withCredentials = true; // Ensure axios sends cookies with requests

  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState(""); // State to hold the OTP input value
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false); // State to track if OTP has been sent
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const inputRefs = React.useRef([]);

  // Clear Error or Success message automatically after 2 sec
  useEffect(() => {
    if (formSuccess || formError) {
      const timer = setTimeout(() => {
        setFormSuccess("");
        setFormError("");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formSuccess, formError]);

  // Function to handle input change and move focus to next input
  const handleInput = (e, index) => {
    if (e.target.value.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus(); // Move to next input
    }
  };

  // Function to handle paste event
  const handlePaste = (e) => {
    e.preventDefault(); // Prevent default paste behavior (paste only 1 character if length ≠ 6 )
    const pastedData = e.clipboardData.getData("text").split("");
    if (pastedData.length === 6) {
      pastedData.forEach((char, index) => {
        if (inputRefs.current[index]) {
          inputRefs.current[index].value = char;
          // Trigger change event so React knows the value changed
          inputRefs.current[index].dispatchEvent(
            new Event("input", { bubbles: true })
          );
        }
      });
      // Move focus to the last input after pasting
      inputRefs.current[5].focus();
    }
    // If length ≠ 6, nothing happens (no paste at all)
  };

  // Function to handle backspace key press
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus(); // Move to previous input
    }
  };

  // Function to handle email submission
  const onSubmitEmailHandler = async (e) => {
    e.preventDefault(); // Prevent default functionality of reload on form submission
    setFormError("");
    setFormSuccess("");
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-reset-otp",
        { email }
      );
      if (data.success) {
        setFormSuccess(data.message);
        // Wait for 1 second, then navigate
        setTimeout(() => {
          setIsEmailSent(true);
        }, 1000); // 1000 ms = 1 second
      } else {
        setFormError(data.message);
      }
    } catch (error) {
      setFormError(error.message);
    }
  };

  // Function to handle OTP submission
  const onSubmitOtpHandler = async (e) => {
    e.preventDefault(); // Prevent reload

    const otpValue = inputRefs.current.map((e) => e.value).join("");
    setOtp(otpValue); // Store OTP in state

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/verify-reset-otp",
        {
          email,
          otp: otpValue,
        }
      );

      if (data.success) {
        setFormSuccess(data.message);
        // Wait for 1 second, then navigate
        setTimeout(() => {
          setIsOtpSubmitted(true); // Move to next form only if OTP is correct
        }, 1000); // 1000 ms = 1 second
      } else {
        setFormError(data.message); // Show error and stay on OTP screen
      }
    } catch (error) {
      setFormError(error.message);
    }
  };

  // Function to handle new password submission
  const onSubmitNewPasswordHandler = async (e) => {
    e.preventDefault(); // Prevent default functionality of reload on form submission

    // Basic validation
    if (!newPassword || !confirmPassword) {
      setFormError("Please fill in both fields");
      return;
    }

    if (newPassword.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/reset-password",
        { email, otp, newPassword }
      );
      if (data.success) {
        setFormSuccess(data.message);
        // Wait for 1 second, then navigate
        setTimeout(() => {
          navigate("/login");
        }, 1000); // 1000 ms = 1 second
      } else {
        setFormError(data.message);
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong."
      );
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, var(--background-light) 0%, var(--primary-light) 60%, var(--accent) 100%)",
      }}
    >
      {/* Form for entering email id */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmailHandler}
          className="p-8 rounded-lg shadow-lg w-96 text-sm"
          style={{
            background: "var(--primary)",
            color: "var(--accent)",
          }}
        >
          <h1
            className="font-extrabold text-center text-2xl pb-3"
            style={{ color: "var(--white)" }}
          >
            Reset Password
          </h1>
          <p
            className="text-center mb-6"
            style={{ color: "var(--primary-light)" }}
          >
            Enter your registered email id
          </p>
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full"
            style={{ background: "var(--ternary)" }}
          >
            <i
              className="fas fa-envelope text-md"
              style={{ color: "var(--white)" }}
            ></i>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-transparent outline-none w-full"
              style={{ color: "var(--white)" }}
            />
          </div>
          {/* Inline Error Message */}
          {formError && (
            <div className="pt-3 text-sm text-red-400 text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {formError}
            </div>
          )}

          {/* Inline Success Message */}
          {formSuccess && (
            <div className="pt-3 text-sm text-green-300 text-center flex items-center justify-center gap-2">
              <i className="fas fa-check-circle"></i>
              {formSuccess}
            </div>
          )}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded mt-4"
            style={{
              background:
                "linear-gradient(130deg, var(--secondary) 0%, var(--accent) 100%)",
              color: "var(--white)",
            }}
          >
            Send OTP
          </button>
        </form>
      )}

      {/* OTP input form */}
      {isEmailSent && !isOtpSubmitted && (
        <form
          onSubmit={onSubmitOtpHandler}
          className="p-8 rounded-lg shadow-lg w-96 text-sm"
          style={{
            background: "var(--primary)",
            color: "var(--accent)",
          }}
        >
          <h1
            className="font-extrabold text-center text-2xl pb-3"
            style={{ color: "var(--white)" }}
          >
            Enter OTP
          </h1>
          <p
            className="text-center mb-4"
            style={{ color: "var(--primary-light)" }}
          >
            Enter the 6-digit code sent to your email
          </p>
          <div className="flex justify-between mb-4">
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-12 h-12 text-center text-xl rounded-md outline-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  style={{
                    background: "var(--ternary)",
                    color: "var(--white)",
                    borderColor: "var(--primary-light)",
                    outline: "none",
                  }}
                  ref={(e) => (inputRefs.current[index] = e)}
                  onChange={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                />
              ))}
          </div>

          {/* Inline Error Message */}
          {formError && (
            <div className="pt-1 pb-3 text-sm text-red-400 text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {formError}
            </div>
          )}

          {/* Inline Success Message */}
          {formSuccess && (
            <div className="pt-1 pb-3 text-sm text-green-300 text-center flex items-center justify-center gap-2">
              <i className="fas fa-check-circle"></i>
              {formSuccess}
            </div>
          )}

          <button
            type="submit"
            className="w-full font-bold py-2 rounded"
            style={{
              background:
                "linear-gradient(130deg, var(--secondary) 0%, var(--accent) 100%)",
              color: "var(--white)",
            }}
          >
            Submit
          </button>
        </form>
      )}

      {/* Reset Password Form */}
      {isOtpSubmitted && (
        <form
          onSubmit={onSubmitNewPasswordHandler}
          className="p-8 rounded-lg shadow-lg w-96 text-sm"
          style={{
            background: "var(--primary)",
            color: "var(--accent)",
          }}
        >
          <h1
            className="font-extrabold text-center text-2xl pb-3"
            style={{ color: "var(--white)" }}
          >
            Set New Password
          </h1>
          <p
            className="text-center mb-6"
            style={{ color: "var(--primary-light)" }}
          >
            Enter the new password
          </p>
          <div
            className="flex items-center gap-3 px-5 py-2.5 rounded-full mb-4"
            style={{ background: "var(--ternary)" }}
          >
            <i
              className="fas fa-lock text-md"
              style={{ color: "var(--white)" }}
            ></i>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="bg-transparent outline-none w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{ color: "var(--white)" }}
            />
            <i
              onClick={() => setShowPassword(!showPassword)}
              className={`fas ${
                showPassword ? "fa-eye-slash" : "fa-eye"
              } cursor-pointer`}
              style={{ color: "var(--white)" }}
            />
          </div>

          <div
            className="flex items-center gap-3 px-5 py-2 rounded-full mb-4"
            style={{ background: "var(--ternary)" }}
          >
            <i
              className="fas fa-lock text-md"
              style={{ color: "var(--white)" }}
            ></i>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              className="bg-transparent outline-none w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ color: "var(--white)" }}
            />
            <i
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`fas ${
                showConfirmPassword ? "fa-eye-slash" : "fa-eye"
              } cursor-pointer`}
              style={{ color: "var(--white)" }}
            />
          </div>

          {/* Inline Error Message */}
          {formError && (
            <div className="pb-3 text-sm text-red-400 text-center flex items-center justify-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              {formError}
            </div>
          )}

          {/* Inline Success Message */}
          {formSuccess && (
            <div className="pb-3 text-sm text-green-300 text-center flex items-center justify-center gap-2">
              <i className="fas fa-check-circle"></i>
              {formSuccess}
            </div>
          )}
          <button
            type="submit"
            className="w-full font-bold py-2 rounded"
            style={{
              background:
                "linear-gradient(130deg, var(--secondary) 0%, var(--accent) 100%)",
              color: "var(--white)",
            }}
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
}
export default ResetPassword;
