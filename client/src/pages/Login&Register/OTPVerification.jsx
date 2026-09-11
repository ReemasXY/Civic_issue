import { useState, useRef, useEffect } from "react";
import { HiMail } from "react-icons/hi";
import { useNavigate } from "react-router";
import axios from "axios";
import errToast from "../../utils/ErrorToast";
import successToast from "../../utils/SuccessToast";

const OTPVerification = ({ email, purpose = "registration" }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Auto-focus the first OTP input field on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handles typing a single digit into an OTP input box.
  // Rejects non-numeric input, updates state, and auto-advances focus to the next field.
  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Moves focus back to the previous input when Backspace is pressed on an empty field
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handles pasting a full or partial OTP code.
  // Distributes pasted digits across the input boxes and focuses the next empty field.
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Requests a new OTP from the server and shows a success or error toast
  const handleResend = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/resend-otp",
        { email, purpose },
        { withCredentials: true }
      );

      if (response.data.message) {
        successToast(response.data.message);
      }
    } catch (error) {
      if (error.response?.data?.error) {
        const errors = Array.isArray(error.response.data.error)
          ? error.response.data.error
          : [error.response.data.error];
        errors.forEach((err) => errToast(err));
      } else {
        errToast("Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submits the 6-digit OTP for verification.
  // On success, shows a toast and navigates to the home page after a short delay.
  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      errToast("Please enter all 6 digits");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/verify-otp",
        {
          email,
          otp: otpCode,
          purpose,
        },
        { withCredentials: true }
      );

      if (response.data.message) {
        successToast(response.data.message);
      }

      // Store user info in localStorage
      if (response.data.user) {
        localStorage.setItem("user_id", response.data.user.user_id);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("username", response.data.user.username);
      }

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      if (error.response?.data?.error) {
        const errors = Array.isArray(error.response.data.error)
          ? error.response.data.error
          : [error.response.data.error];
        errors.forEach((err) => errToast(err));
      } else {
        errToast("Verification failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white rounded-[22px] border border-[#E5EBE8] shadow-[0_1px_2px_rgba(20,35,59,0.04),0_24px_48px_-18px_rgba(20,35,59,0.18)] p-6 sm:p-9">
      {/* Email Icon */}
      <div className="flex justify-center mb-5">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 shadow-lg shadow-teal-500/20">
          <HiMail className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-[22px] font-semibold text-[#14233B] text-center tracking-tight leading-tight mb-1.5">
        Check your email
      </h2>

      {/* Subtitle */}
      <p className="text-[13px] text-[#687585] text-center mb-6">
        Enter the verification code sent to{" "}
        <span className="font-medium text-[#14233B]">{email}</span>
      </p>

      {/* OTP Input Form */}
      <form onSubmit={handleVerify}>
        <div className="flex justify-center gap-2 sm:gap-2.5 mb-5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] text-center text-[20px] font-semibold text-[#14233B] bg-white border-2 rounded-lg transition-all duration-200 outline-none ${
                digit
                  ? "border-[#1F8A70] shadow-[0_0_0_3px_rgba(31,138,112,0.1)]"
                  : "border-[#E5EBE8] hover:border-[#CFD3CF]"
              } focus:border-[#1F8A70] focus:shadow-[0_0_0_3px_rgba(31,138,112,0.1)]`}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Resend Code */}
        <p className="text-center text-[12.5px] text-[#687585] mb-5">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading}
            className="font-semibold text-[#1F8A70] hover:text-[#14233B] transition-colors disabled:opacity-50"
          >
            resend
          </button>
        </p>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={isLoading || otp.some((digit) => !digit)}
          className="w-full cursor-pointer rounded-xl bg-[#14233B] py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:bg-[#1F8A70] hover:shadow-lg hover:shadow-[#1F8A70]/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:bg-[#14233B]"
        >
          {isLoading ? "Verifying..." : "Verify email"}
        </button>
      </form>
    </div>
  );
};

export default OTPVerification;
