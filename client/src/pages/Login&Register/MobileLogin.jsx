import React from 'react'
import LogInFields from "./LogInFields"
import SignUpFields from './SignUpFields';
const MobileLogin = ({signUpForm, update, setIsSignUp, isSignUp,loginForm , updateLogin }) => {
     const slide = "transition-transform duration-700 ease-in-out";
  const fade = "transition-opacity duration-700 ease-in-out";

  return (   <div className="md:hidden w-full max-w-[420px] bg-white rounded-[22px] border border-[#E5EBE8] shadow-[0_1px_2px_rgba(20,35,59,0.04),0_20px_44px_-16px_rgba(20,35,59,0.16)] p-6 sm:p-7">

        {/* CivicCare Logo */}

        <div className="flex items-center gap-2 mb-5">
          <div className="flex items-center -space-x-1">
            <span className="h-3 w-3 rounded-full bg-[#14233B]" />
            <span className="h-3 w-3 rounded-full bg-[#1F8A70]" />
          </div>

          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#14233B] tracking-tight">
              CivicCare
            </span>

            <span className="text-[9px] font-medium text-[#1F8A70]">
              Report. Track. Resolve.
            </span>
          </div>
        </div>

        {/* Pill switch */}

        <div className="relative flex rounded-full bg-[#F1F4F3] p-1 mb-6">
          <span
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-[#14233B] ${slide}`}
            style={{
              transform: isSignUp
                ? "translateX(calc(100% + 4px))"
                : "translateX(4px)",
            }}
          />

          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
              !isSignUp ? "text-white" : "text-[#687585]"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`relative z-10 flex-1 py-2.5 text-[13px] font-medium transition-colors duration-200 ${
              isSignUp ? "text-white" : "text-[#687585]"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div
          key={isSignUp ? "up" : "in"}
          className="animate-[fadeIn_0.35s_ease-out]"
        >
          {isSignUp ? (
            <>
              <h1 className="text-[21px] font-semibold text-[#14233B] tracking-tight leading-tight">
                Create Your CivicCare Account
              </h1>

              <p className="text-[12.5px] text-[#687585] mt-1 mb-5">
                Sign up to start reporting issues around you
              </p>

              <SignUpFields signUpForm={signUpForm} update={update}/>

              <p className="text-center text-[12.5px] text-[#687585] mt-5">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="font-semibold text-[#1F8A70]"
                >
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[21px] font-semibold text-[#14233B] tracking-tight leading-tight">
                Welcome Back to CivicCare
              </h1>

              <p className="text-[12.5px] text-[#687585] mt-1 mb-5">
                Sign in to report and track civic issues in your community
              </p>

              <LogInFields loginForm={loginForm} updateLogin={updateLogin}/>

              <p className="text-center text-[12.5px] text-[#687585] mt-5">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="font-semibold text-[#1F8A70]"
                >
                  Create an account
                </button>
              </p>
            </>
          )}
        </div>
      </div>
  )
}

export default MobileLogin