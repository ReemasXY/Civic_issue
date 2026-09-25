import { useState } from "react";
import { useNavigate } from "react-router";
import Field from "./Field";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import errToast from "../../utils/ErrorToast.js";
import successToast from "../../utils/SuccessToast.js";

const SignUpFields = ({ signUpForm, update }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username: signUpForm.name,
          email: signUpForm.email,
          phone_number: signUpForm.phone,
          password: signUpForm.password,
          confirm_password: signUpForm.confirm,
        },
        {
          withCredentials: true,
        }
      );

      console.log("Registration response:", response.data);

      // Display success message from backend
      if (response.data.message) {
        successToast(response.data.message);
      }

      // DIRECT REGISTRATION: Store user info and redirect immediately
      if (response.data.user) {
        localStorage.setItem("user_id", response.data.user.user_id);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("username", response.data.user.username);
      }

      // Redirect based on role after a short delay
      setTimeout(() => {
        const userRole = response.data.user?.role || localStorage.getItem("role");

        if (userRole === "officer") {
          navigate("/officer/dashboard");
        } else {
          navigate("/");
        }
      }, 1500);

      // COMMENTED OUT: OTP verification flow
      // // Show OTP verification
      // setTimeout(() => {
      //   onShowOTP(signUpForm.email, "registration");
      // }, 1000);
    } catch (error) {
      if (error.response) {
        console.error(
          "Registration failed:",
          error.response.data
        );

        const errors = error.response.data.error;

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
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Field
        name="name"
        placeholder="Full name"
        value={signUpForm.name}
        onChange={update("name")}
        autoComplete="name"
      />

      <Field
        name="email"
        type="email"
        placeholder="example@gmail.com"
        value={signUpForm.email}
        onChange={update("email")}
        autoComplete="email"
      />

      <Field
        name="phone"
        type="tel"
        placeholder="+977 98XX-XXXXXX"
        value={signUpForm.phone}
        onChange={update("phone")}
        autoComplete="tel"
      />

      <div className="relative">
        <Field
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={signUpForm.password}
          onChange={update("password")}
          autoComplete="new-password"
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

      <div className="relative">
        <Field
          name="confirm"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm password"
          value={signUpForm.confirm}
          onChange={update("confirm")}
          autoComplete="new-password"
        />

        <button
          type="button"
          onClick={() =>
            setShowConfirmPassword((prev) => !prev)
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
          aria-label={
            showConfirmPassword
              ? "Hide confirm password"
              : "Show confirm password"
          }
        >
          {showConfirmPassword ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer rounded-lg bg-[#14233B] py-2.5 text-[13.5px] font-semibold text-white transition-all duration-200 hover:bg-[#1F8A70] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#14233B] mt-1"
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
};

export default SignUpFields;
