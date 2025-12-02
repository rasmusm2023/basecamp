"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "./Header";
import { useAuth } from "../contexts/AuthContext";
import { CaretDown, CaretRight, Check } from "./icons";

type FieldState = "empty" | "valid" | "error";

export default function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Input refs for click-to-focus functionality
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getEmailState = (): FieldState => {
    if (!touched.email || !email) return "empty";
    if (errors.email) return "error";
    if (validateEmail(email)) return "valid";
    return "empty";
  };

  const getPasswordState = (): FieldState => {
    if (!touched.password || !password) return "empty";
    if (errors.password) return "error";
    if (password.length > 0) return "valid";
    return "empty";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setTouched((prev) => ({ ...prev, email: true }));

    if (value && !validateEmail(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email (e.g. name@example.com)",
      }));
    } else {
      setErrors((prev) => {
        const { email, ...rest } = prev;
        return rest;
      });
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setTouched((prev) => ({ ...prev, password: true }));

    if (value && value.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
    } else {
      setErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    }
  };

  const isFormValid = () => {
    return (
      validateEmail(email) &&
      password.length >= 8 &&
      Object.keys(errors).length === 0
    );
  };

  const handleLogin = async () => {
    if (isFormValid() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await signIn(email, password);
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Error logging in:", error);
        // Handle Firebase auth errors
        if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
          setErrors((prev) => ({
            ...prev,
            email: "Invalid email or password",
            password: "Invalid email or password",
          }));
        } else if (error.code === "auth/invalid-email") {
          setErrors((prev) => ({
            ...prev,
            email: "Invalid email address",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            email: "Failed to sign in. Please try again.",
          }));
        }
        setIsSubmitting(false);
      }
    }
  };

  const emailState = getEmailState();
  const passwordState = getPasswordState();

  return (
    <div className="bg-[#0d0d0d] box-border flex flex-col gap-[100px] items-center px-[36px] py-[16px] min-h-screen w-full">
      <Header />

      <div className="flex flex-col gap-[64px] items-center max-w-[480px] relative w-full">
        {/* Title Section */}
        <div className="flex flex-col gap-[16px] items-center relative">
          <div className="flex flex-col gap-[17px] items-center">
            <p className="text-white text-[24px] text-center font-light font-sans">
              Log in
            </p>
            <div className="relative shrink-0 w-[16px] h-[16px]">
              <CaretDown size={16} weight="bold" color="white" />
            </div>
          </div>
          <h1 className="text-white text-center leading-none font-sans">
            <span className="font-medium text-[40px]">{`Accessing your `}</span>
            <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[44px] font-serif">
              basecamp
            </span>
            <span className="font-medium text-[40px]">.</span>
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-[36px] items-start relative w-full">
          {/* Email Field */}
          <div className="flex flex-col gap-[8px] items-start relative w-full">
            <p className="text-[#f2f2f2] text-[14px] font-semibold font-sans">
              Email
            </p>
            <div
              onClick={() => emailInputRef.current?.focus()}
              className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                emailState === "error"
                  ? "border-[#fa8282]"
                  : emailState === "valid"
                  ? "border-[rgba(255,255,255,0.6)]"
                  : "border-[rgba(194,194,194,0.25)]"
              } focus-within:border-[rgba(255,255,255,0.6)]`}
            >
              <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="your@email.com"
                  className="bg-transparent border-none outline-none text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#868686] cursor-text"
                />
                {emailState === "valid" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[16px] items-start relative w-full">
            <div className="flex flex-col gap-[8px] items-start relative w-full">
              <p className="text-[#f2f2f2] text-[14px] font-semibold font-sans">
                Password
              </p>
              <div
                onClick={() => passwordInputRef.current?.focus()}
                className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                  passwordState === "error"
                    ? "border-[#fa8282]"
                    : passwordState === "valid"
                    ? "border-[rgba(255,255,255,0.6)]"
                    : "border-[rgba(194,194,194,0.25)]"
                } focus-within:border-[rgba(255,255,255,0.6)]`}
              >
                <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Choose a password"
                    className="bg-transparent border-none outline-none text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#868686] cursor-text"
                  />
                  {passwordState === "valid" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <Check />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex gap-[8px] items-center relative w-full">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[4px] transition-all duration-300 cursor-pointer w-[18px] h-[18px] flex items-center justify-center ${
                  rememberMe
                    ? "border-[rgba(255,255,255,0.6)]"
                    : "border-[rgba(194,194,194,0.25)]"
                }`}
              >
                {rememberMe && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
              </button>
              <p className="text-[#f2f2f2] text-[14px] font-semibold font-sans opacity-60">
                Remember me
              </p>
            </div>
          </div>

          {/* Log In Button */}
          <button
            type="button"
            onClick={handleLogin}
            disabled={!isFormValid() || isSubmitting}
            className={`w-full flex items-center justify-between px-[16px] py-[20px] rounded-[8px] transition-all duration-300 ${
              isFormValid() && !isSubmitting
                ? "bg-[#ffff31] shadow-[8px_8px_64px_0px_rgba(250,250,130,0.25)] cursor-pointer hover:opacity-90 hover:shadow-[8px_8px_64px_0px_rgba(250,250,130,0.35)] text-[#0d0d0d] transform hover:scale-[1.01]"
                : "bg-[rgba(255,255,49,0.4)] cursor-not-allowed text-[#0d0d0d]"
            }`}
          >
            <div className="w-[16px]" />
            <p className="text-[16px] font-bold font-sans transition-opacity duration-300">
              {isSubmitting ? "Logging in..." : "Log In"}
            </p>
            <div className="relative shrink-0 w-[16px] h-[16px] transition-transform duration-300">
              <CaretRight size={16} weight="bold" />
            </div>
          </button>
        </div>

        {/* Create Account Link */}
        <div className="flex gap-[8px] items-start font-medium text-[14px] font-sans">
          <p className="text-[#999999]">New here? </p>
          <Link
            href="/signup"
            className="underline text-[#ffff31] transition-colors duration-300"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
