import React from 'react'
import Field from './Field';
import axios from "axios";
//  import {  toast } from 'react-toastify';

import errToast from '../../utils/ErrorToast.js';
const SignUpFields = ({ signUpForm, update }) => {
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          username: signUpForm.name,
          email: signUpForm.email,
          phone_number: signUpForm.phone,
          password: signUpForm.password,
          confirm_password: signUpForm.confirm,
        }
      );

      console.log("Registration successful:", response.data);

      // JWT returned by backend
      console.log("Token:", response.data.token);


    } catch (error) {
      if (error.response) {
        // Backend returned an error response
        console.error(
          "Registration failed:",
          error.response.data
        );
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

      <Field
        name="password"
        type="password"
        placeholder="Password"
        value={signUpForm.password}
        onChange={update("password")}
        autoComplete="new-password"
      />

      <Field
        name="confirm"
        type="password"
        placeholder="Confirm password"
        value={signUpForm.confirm}
        onChange={update("confirm")}
        autoComplete="new-password"
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-[#14233B] py-2.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-[#1F8A70] mt-1"

      >
        Sign Up
      </button>
     
    </form>
  );
};


export default SignUpFields