import React, { useState, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

import MobileLogin from "./MobileLogin";
import DesktopLogin from "./DesktopLogin";
import Toast from "../../utils/Toast";

gsap.registerPlugin(useGSAP);

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);

  const loginRef = useRef(null);

  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [loginForm, setLoginForm] = useState({
    loginEmail: "",
    loginPassword: "",
  });

  const update = (key) => (e) => {
    setSignUpForm((form) => ({
      ...form,
      [key]: e.target.value,
    }));
  };

  const updateLogin = (key) => (e) => {
    setLoginForm((form) => ({
      ...form,
      [key]: e.target.value,
    }));
  };

  useGSAP(
    () => {
      if (!loginRef.current) return;

      gsap.fromTo(
        loginRef.current,
        {
          opacity: 0,
          y: 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          delay: 0.05,
          ease: "power2.out",
          force3D: true,
          clearProps: "transform",
        }
      );
    },
    {
      scope: loginRef,
    }
  );

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#F6F8F7] font-sans">

      <Toast />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .font-sans {
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      <div
        ref={loginRef}
        className="min-h-screen w-full flex items-center justify-center px-4 py-6"
      >
        <MobileLogin
          signUpForm={signUpForm}
          update={update}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          loginForm={loginForm}
          updateLogin={updateLogin}
        />

        <DesktopLogin
          signUpForm={signUpForm}
          update={update}
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          loginForm={loginForm}
          updateLogin={updateLogin}
        />
      </div>
    </div>
  );
}