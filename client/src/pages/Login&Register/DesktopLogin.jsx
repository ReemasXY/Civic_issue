import React from 'react'
import LogInFields from "./LogInFields"
import SignUpFields from './SignUpFields';

const DesktopLogin = ({signUpForm, update,setIsSignUp , isSignUp,loginForm, updateLogin}) => {
     const slide = "transition-transform duration-700 ease-in-out";
  const fade = "transition-opacity duration-700 ease-in-out";
  return (
        <div className="hidden md:block relative w-full max-w-[820px] h-[500px] max-h-[86vh] bg-white rounded-[26px] border border-[#E5EBE8] shadow-[0_1px_2px_rgba(20,35,59,0.04),0_24px_48px_-18px_rgba(20,35,59,0.18)] overflow-hidden">

        {/* ============================================================
            SIGN IN
        ============================================================ */}

        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-9 lg:px-12 bg-white ${slide}`}
          style={{
            transform: isSignUp ? "translateX(100%)" : "translateX(0)",
            zIndex: 2,
          }}
        >
          <div className="mb-1">
            <h1 className="text-[25px] font-semibold text-[#14233B] tracking-tight leading-tight">
              Welcome Back to CivicCare
            </h1>

            <p className="text-[12.5px] text-[#687585] mt-1.5 mb-6">
              Sign in to report and track civic issues in your community
            </p>
          </div>

          <LogInFields loginForm={loginForm} updateLogin={updateLogin}/>
        </div>

        {/* ============================================================
            SIGN UP
        ============================================================ */}

        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-9 lg:px-12 bg-white ${slide} ${fade}`}
          style={{
            transform: isSignUp ? "translateX(100%)" : "translateX(0)",
            opacity: isSignUp ? 1 : 0,
            zIndex: isSignUp ? 5 : 1,
            pointerEvents: isSignUp ? "auto" : "none",
          }}
        >
          <h1 className="text-[25px] font-semibold text-[#14233B] tracking-tight leading-tight">
            Create Your CivicCare Account
          </h1>

          <p className="text-[12.5px] text-[#687585] mt-1.5 mb-5">
            Sign up to start reporting issues around you
          </p>

          <SignUpFields signUpForm={signUpForm} update={update} />
        </div>

        {/* ============================================================
            SLIDING CIVICCARE PANEL
        ============================================================ */}

        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden ${slide}`}
          style={{
            transform: isSignUp ? "translateX(-100%)" : "translateX(0)",
            zIndex: 50,
          }}
        >
          <div
            className={`relative left-[-100%] h-full w-[200%] text-white ${slide}`}
            style={{
              transform: isSignUp ? "translateX(50%)" : "translateX(0)",
              background:
                "linear-gradient(135deg, #14233B 0%, #193B50 55%, #1F8A70 100%)",
            }}
          >
            {/* Decorative circles */}

            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full border border-white/10" />

            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />

            {/* ========================================================
                WELCOME BACK
            ======================================================== */}

            <div
              className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-8 lg:px-9 ${slide}`}
              style={{
                transform: isSignUp ? "translateX(0)" : "translateX(-18%)",
              }}
            >
              <div className="mb-5 flex items-center justify-center">
                <div className="flex items-center -space-x-2">
                  <span className="h-5 w-5 rounded-full bg-white" />
                  <span className="h-5 w-5 rounded-full border-2 border-white bg-[#1F8A70]" />
                </div>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/65">
                CivicCare
              </p>

              <h2 className="text-[22px] lg:text-[23px] font-semibold tracking-tight mt-2">
                Welcome Back!
              </h2>

              <p className="text-[13px] text-white/85 mt-3 leading-relaxed">
                Already reporting issues with us? Sign in to track your
                submissions and updates.
              </p>

              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="mt-6 rounded-full border border-white/80 px-8 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors hover:bg-white hover:text-[#14233B]"
              >
                Sign In
              </button>
            </div>

            {/* ========================================================
                JOIN CIVICCARE
            ======================================================== */}

            <div
              className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-8 lg:px-9 ${slide}`}
              style={{
                transform: isSignUp ? "translateX(18%)" : "translateX(0)",
              }}
            >
              <div className="mb-5 flex items-center justify-center">
                <div className="flex items-center -space-x-2">
                  <span className="h-5 w-5 rounded-full border-2 border-white bg-[#1F8A70]" />
                  <span className="h-5 w-5 rounded-full bg-white" />
                </div>
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-white/65">
                CivicCare
              </p>

              <h2 className="text-[22px] lg:text-[23px] font-semibold tracking-tight mt-2">
                Welcome to CivicCare!
              </h2>

              <p className="text-[13px] text-white/85 mt-3 leading-relaxed">
                New here? Create an account and start reporting civic issues
                in your ward today.
              </p>

              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="mt-6 rounded-full border border-white/80 px-8 py-2.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors hover:bg-white hover:text-[#14233B]"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default DesktopLogin