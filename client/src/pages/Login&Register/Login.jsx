import React, { useState } from "react";

import MobileLogin from "./MobileLogin";
import DesktopLogin from "./DesktopLogin";
import Toast from '../../utils/Toast';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  const [signUpForm, setsignUpForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [loginForm, setloginForm] = useState({
    loginEmail:"",
    loginPassword:""
  })


  const update = (key) => (e) =>
    setsignUpForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

    const updateLogin = (key) => (e) =>
    setloginForm((f) => ({
      ...f,
      [key]: e.target.value,
    }));

  return (
    <div className="min-h-screen w-full bg-[#F6F8F7] flex items-center justify-center px-4 py-6 font-sans">
       <Toast />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .font-sans {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ==============================================================
          MOBILE
      ============================================================== */}
      <MobileLogin signUpForm= {signUpForm} update={update} isSignUp={isSignUp} setIsSignUp={setIsSignUp}  loginForm={loginForm} updateLogin={updateLogin}></MobileLogin>



      {/* ==============================================================
          DESKTOP
      ============================================================== */}
      <DesktopLogin signUpForm= {signUpForm} update={update} isSignUp={isSignUp} setIsSignUp={setIsSignUp} loginForm={loginForm} updateLogin={updateLogin}></DesktopLogin>

    </div>
  );
}