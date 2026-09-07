
import React, { useState } from 'react'
import Field from './Field';
import axios from "axios"
import errToast from '../../utils/ErrorToast';
const LogInFields = ({ loginForm, updateLogin }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(loginForm) 
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {

          email: loginForm.loginEmail,
          password: loginForm.loginPassword,
        }
      );

      console.log("login successful:", response.data);

      // JWT returned by backend
      console.log("Token:", response.data.token);

    } catch (error) {
      if (error.response) {
        // Backend returned an error response
        const errors = error.response.data.error;
        console.log(errors)
        errors.forEach((err) => {
          errToast(err)
        })
      } else if (error.request) {
        // Request was sent but no response was received
        console.error(
          "No response from server:",
          error.request
        );
      } else {
        // Error while setting up the request
        console.error(
          "Request failed:",
          error.message
        );
      }
    }
  }
  const [remember, setRemember] = useState(false)
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

      <Field
        name="loginPassword"
        type="password"
        placeholder="enter password..."
        value={loginForm.loginPassword}
        onChange={updateLogin("loginPassword")}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between pt-0.5">
        <label className="flex items-center gap-2 text-[12.5px] text-[#687585] cursor-pointer select-none">
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
          className="text-[12.5px] text-[#687585] hover:text-[#1F8A70] transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[#14233B] py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1F8A70]"
      >
        Log In
      </button>
    </form>
  );
};

export default LogInFields