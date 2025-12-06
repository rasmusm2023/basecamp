"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showErrorBorders, setShowErrorBorders] = useState(false);
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
    if (validateEmail(email)) return "valid";
    return "empty";
  };

  const getPasswordState = (): FieldState => {
    if (!touched.password || !password) return "empty";
    if (password.length > 0) return "valid";
    return "empty";
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setTouched((prev) => ({ ...prev, email: true }));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setTouched((prev) => ({ ...prev, password: true }));
  };

  const handleEmailFocus = () => {
    // Clear error borders when user focuses on email field (but keep errors for tooltip)
    setShowErrorBorders(false);
  };

  const handlePasswordFocus = () => {
    // Clear error borders when user focuses on password field (but keep errors for tooltip)
    setShowErrorBorders(false);
  };

  const isFormValid = () => {
    // Button activates if both fields have a value (simpler validation for login)
    return email.length > 0 && password.length > 0;
  };

  const handleLogin = async () => {
    if (isFormValid() && !isSubmitting) {
      setHasSubmitted(true);
      setIsSubmitting(true);
      // Clear previous errors
      setErrors({});
      setShowErrorBorders(false);
      try {
        await signIn(email, password, rememberMe);
        router.push("/dashboard");
      } catch (error: any) {
        // Handle Firebase auth errors
        // Firebase v9+ errors have error.code, but we also check error.message as fallback
        const errorCode = error?.code;
        const errorMessage = error?.message || "";
        
        // Handle credential errors (expected user behavior - don't log to console)
        if (
          errorCode === "auth/invalid-credential" ||
          errorCode === "auth/user-not-found" ||
          errorCode === "auth/wrong-password" ||
          errorMessage.includes("invalid-credential") ||
          errorMessage.includes("user-not-found") ||
          errorMessage.includes("wrong-password")
        ) {
          setErrors({
            email: "Invalid email or password",
            password: "Invalid email or password",
          });
          setShowErrorBorders(true);
        } else if (errorCode === "auth/invalid-email" || errorMessage.includes("invalid-email")) {
          setErrors({
            email: "Invalid email address",
          });
          setShowErrorBorders(true);
        } else {
          // Log unexpected errors only
          console.error("Unexpected login error:", error);
          setErrors({
            email: "Failed to sign in. Please try again.",
          });
          setShowErrorBorders(true);
        }
        setIsSubmitting(false);
      }
    }
  };

  const emailState = getEmailState();
  const passwordState = getPasswordState();

  return (
    <div className="bg-bg-primary box-border flex flex-col gap-[100px] items-center px-[36px] py-[16px] min-h-screen w-full transition-colors duration-300">
      <div className="flex flex-col gap-[64px] items-center max-w-[600px] relative w-full">
        {/* Title Section */}
        <div className="flex flex-col gap-[16px] items-center relative">
          <div className="flex flex-col gap-[17px] items-center">
            <p className="text-text-primary text-[24px] text-center font-light font-sans transition-colors duration-300">
              Log in
            </p>
            <div className="relative shrink-0 w-[16px] h-[16px]">
              <CaretDown
                size={16}
                weight="bold"
                className="text-text-primary transition-colors duration-300"
              />
            </div>
          </div>
          <h1 className="text-text-primary text-center leading-none font-sans transition-colors duration-300">
            <span className="font-medium text-[40px]">{`Accessing your `}</span>
            <span className="text-gradient-basecamp italic text-[44px] font-serif">
              basecamp
            </span>
            <span className="font-medium text-[40px]">.</span>
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-[36px] items-start relative w-full">
          {/* Email Field */}
          <div className="flex flex-col gap-[8px] items-start relative w-full">
            <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
              Email
            </p>
            <div
              onClick={() => emailInputRef.current?.focus()}
              className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                showErrorBorders
                  ? "input-border-error"
                  : emailState === "valid"
                  ? "input-border-focus"
                  : "input-border-default"
              } focus-within:border-2`}
            >
              <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                <input
                  ref={emailInputRef}
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onFocus={handleEmailFocus}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && password) {
                      e.preventDefault();
                      handleLogin();
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Your@email.com"
                  className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text"
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
              <p className="text-text-secondary text-[14px] font-semibold font-sans transition-colors duration-300">
                Password
              </p>
              <div
                onClick={() => passwordInputRef.current?.focus()}
                className={`input-bg-gradient backdrop-blur-sm border-2 relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                  showErrorBorders
                    ? "input-border-error"
                    : passwordState === "valid"
                    ? "input-border-focus"
                    : "input-border-default"
                } focus-within:border-2`}
              >
                <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onFocus={handlePasswordFocus}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLogin();
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Choose a password"
                    className="bg-transparent border-none outline-none text-text-secondary text-[14px] font-semibold font-sans w-full placeholder:text-text-placeholder cursor-text"
                  />
                  {passwordState === "valid" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <Check />
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Error Tooltip - Only show after submission */}
            {hasSubmitted && (errors.email || errors.password) && (
              <div className="bg-[#fa8282] dark:bg-[#fa8282] border-2 border-[#fa8282] dark:border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                  <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[14px] font-semibold font-sans transition-colors duration-300">
                    {errors.password || errors.email}
                  </p>
                  <p className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-normal font-sans transition-colors duration-300">
                    Please check your credentials and try again.
                  </p>
                  <Link
                    href="/reset-password"
                    className="text-[#0d0d0d] dark:text-[#0d0d0d] text-[12px] font-semibold font-sans underline transition-colors duration-300 hover:opacity-80"
                  >
                    Reset password
                  </Link>
                </div>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex gap-[8px] items-center relative w-full">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`bg-gradient-to-t from-input-bg-start to-input-bg-end backdrop-blur-sm border relative rounded-[4px] transition-all duration-300 cursor-pointer w-[18px] h-[18px] flex items-center justify-center ${
                  rememberMe ? "input-border-focus" : "input-border-default"
                }`}
              >
                {rememberMe && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
              </button>
              <p className="text-text-secondary text-[14px] font-semibold font-sans opacity-60 transition-colors duration-300">
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
                ? "btn-cta cursor-pointer"
                : "btn-cta-disabled"
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
          <p className="text-text-tertiary transition-colors duration-300">
            New here?{" "}
          </p>
          <Link
            href="/signup"
            className="underline text-accent-primary transition-colors duration-300"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
