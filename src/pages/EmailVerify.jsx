import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../context/AppContext";

function EmailVerify() {
  axios.defaults.withCredentials = true; // Ensure axios sends cookies with requests
  const { backendUrl, isLoggedIn, userData, getUserData, setIsLoggedIn } =
    useContext(AppContext);
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);

  const handleInput = (e, index) => {
    if (e.target.value.length === 1 && index < 5) {
      inputRefs.current[index + 1].focus(); // Move to next input
    }
  };

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

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus(); // Move to previous input
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault(); // Prevent default functionality of reload on form submission
    const tempUser = JSON.parse(localStorage.getItem("tempUserData"));

    const otp = inputRefs.current.map((e) => e.value || "").join("");
    if (otp.length !== 6) {
      toast.error("Enter 6-digit OTP");
      return;
    }
    try {
      const { data } = await axios.post(
        backendUrl + "/api/auth/register",
        { email: tempUser.email, otp },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message);
        localStorage.removeItem("tempUserData");
        setIsLoggedIn(true);

        // Wait a tick to ensure cookie is set before fetching user data
        setTimeout(() => {
          getUserData();
          navigate("/");
        }, 200);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    isLoggedIn && userData && userData.isAccountVerified && navigate("/"); // Redirect to home if already logged in and verified
  }, [isLoggedIn, userData]);

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, var(--background-light) 0%, var(--primary-light) 60%, var(--accent) 100%)",
      }}
    >
      <form
        onSubmit={handleOtpVerify}
        className="p-8 rounded-lg shadow-lg w-96 text-sm"
        style={{
          background: "var(--primary)",
          color: "var(--accent)",
        }}
      >
        <h1
          className="font-extrabold text-center text-2xl pb-4"
          style={{ color: "var(--white)" }}
        >
          Email Verification OTP
        </h1>
        <p
          className="text-center mb-6"
          style={{ color: "var(--primary-light)" }}
        >
          Enter the 6-digit code sent to your email
        </p>
        <div className="flex justify-between mb-8">
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
                    boxShadow: "none",
                }}
                ref={(e) => (inputRefs.current[index] = e)}
                onChange={(e) => handleInput(e, index)} // Handle input change
                onKeyDown={(e) => handleKeyDown(e, index)} // Handle backspace key
                onPaste={handlePaste} // Handle paste event
              />
            ))}
        </div>
        <button
          type="submit"
          className="w-full font-bold py-2 rounded"
          style={{
            background:
              "linear-gradient(130deg, var(--secondary) 0%, var(--accent) 100%)",
            color: "var(--white)",
          }}
        >
          Verify Email
        </button>
      </form>
    </div>
  );
}

export default EmailVerify;
