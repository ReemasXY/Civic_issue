import { useState } from "react";
import Field from "./Field";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import errToast from "../../utils/ErrorToast";
import successToast from "../../utils/SuccessToast";

const LogInFields = ({ loginForm, updateLogin, onShowOTP }) => {
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(loginForm);

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: loginForm.loginEmail,
          password: loginForm.loginPassword,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Login response:", response.data);

      // Display success message from backend
      if (response.data.message) {
        successToast(response.data.message);
      }

      // Show OTP verification
      setTimeout(() => {
        onShowOTP(loginForm.loginEmail, "login");
      }, 1000);
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.error;
        console.log(errors);

        errors.forEach((err) => {
          errToast(err);
        });
      } else if (error.request) {
        console.error(
          "No response from server:",
          error.request
        );
        errToast("Server is not responding. Please try again.");
      } else {
        console.error(
          "Request failed:",
          error.message
        );
        errToast("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-3.5" onSubmit={handleSubmit}>
      <Field
        name="loginEmail"
        type="email"
        placeholder="stanley@gmail.com"
        value={loginForm.loginEmail}
        onChange={updateLogin("loginEmail")}
        autoComplete="email"
      />

      <div className="relative">
        <Field
          name="loginPassword"
          type={showPassword ? "text" : "password"}
          placeholder="enter password..."
          value={loginForm.loginPassword}
          onChange={updateLogin("loginPassword")}
          autoComplete="current-password"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex cursor-pointer select-none items-center gap-2 text-[12.5px] text-[#687585]">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember((r) => !r)}
            className="h-3.5 w-3.5 rounded border-[#CFD3CF] text-[#1F8A70] focus:ring-[#1F8A70]/30"
          />

          Remember me
        </label>

        <button
          type="button"
          className="cursor-pointer text-[12.5px] text-[#687585] transition-colors hover:text-[#1F8A70]"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-lg bg-[#14233B] py-2.5 text-[13.5px] font-semibold text-white transition-all duration-200 hover:bg-[#1F8A70] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#14233B]"
      >
        {isLoading ? "Sending code..." : "Log In"}
      </button>
    </form>
  );
};

export default LogInFields;
