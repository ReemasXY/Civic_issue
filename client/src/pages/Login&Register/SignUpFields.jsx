import React, { useState } from "react";
import Field from "./Field";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router";
import errToast from "../../utils/ErrorToast.js";
import successToast from "../../utils/SuccessToast.js";

const SignUpFields = ({ signUpForm, update }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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

      console.log("Registration successful:", response.data);
      console.log("Token:", response.data.token);

      // Display success message from backend
      if (response.data.message) {
        successToast(response.data.message);
      }

      // Redirect to home page after successful registration
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
      } else {
        console.error(
          "Request failed:",
          error.message
        );
      }
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
        className="w-full cursor-pointer rounded-lg bg-[#14233B] py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1F8A70] mt-1"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUpFields;