"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "./Header";
import CaretDown from "./icons/CaretDown";
import CaretRight from "./icons/CaretRight";
import Check from "./icons/Check";
import WarningCircle from "./icons/WarningCircle";
import Info from "./icons/Info";
import Key from "./icons/Key";
import XCircle from "./icons/XCircle";

type FieldState = "empty" | "valid" | "error";

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function CreateAccountForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
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
    if (validatePassword(password)) return "valid";
    return "empty";
  };

  const getConfirmPasswordState = (): FieldState => {
    if (!touched.confirmPassword || !confirmPassword) return "empty";
    if (errors.confirmPassword) return "error";
    if (password && confirmPassword && password === confirmPassword)
      return "valid";
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

    if (value && !validatePassword(value)) {
      setErrors((prev) => ({
        ...prev,
        password: "Enter a valid password",
      }));
    } else {
      setErrors((prev) => {
        const { password, ...rest } = prev;
        return rest;
      });
    }

    // Clear confirm password error if passwords now match
    if (confirmPassword && value === confirmPassword) {
      setErrors((prev) => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setTouched((prev) => ({ ...prev, confirmPassword: true }));

    if (value && password && value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords don't match",
      }));
    } else {
      setErrors((prev) => {
        const { confirmPassword, ...rest } = prev;
        return rest;
      });
    }
  };

  const isFormValid = () => {
    return (
      validateEmail(email) &&
      validatePassword(password) &&
      password === confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

  const emailState = getEmailState();
  const passwordState = getPasswordState();
  const confirmPasswordState = getConfirmPasswordState();

  return (
    <div className="bg-[#0d0d0d] box-border flex flex-col gap-[100px] items-center px-[36px] py-[16px] min-h-screen w-full">
      <Header />

      <div className="flex flex-col gap-[64px] items-center max-w-[480px] relative w-full">
        {/* Title Section */}
        <div className="flex flex-col gap-[16px] items-center relative">
          <div className="flex flex-col gap-[17px] items-center">
            <p className="text-white text-[20px] text-center font-light font-sans">
              Create an account
            </p>
            <div className="relative shrink-0 w-[16px] h-[16px]">
              <CaretDown />
            </div>
          </div>
          <h1 className="text-white text-center leading-none font-sans">
            <span className="font-medium text-[36px]">{`Lets start with the `}</span>
            <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[40px] font-serif">
              basics
            </span>
            <span className="font-medium text-[36px]">.</span>
          </h1>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-[36px] items-start relative w-full">
          {/* Email Field */}
          <div className="flex flex-col gap-[16px] items-start relative w-full">
            <p className="text-[#f2f2f2] text-[12px] font-semibold font-sans">
              Email
            </p>
            <div className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] border-2 relative rounded-[8px] w-full transition-all duration-300 ${
              emailState === "error" 
                ? "border-[#fa8282]" 
                : emailState === "valid"
                ? "border-[rgba(255,255,255,0.25)]"
                : "border-[rgba(255,255,255,0.15)]"
            }`}>
              <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-transparent border-none outline-none text-[#f2f2f2] text-[12px] font-semibold font-sans w-full placeholder:text-[#868686] placeholder:opacity-50 transition-opacity duration-200 focus:placeholder:opacity-30"
                />
                {emailState === "valid" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
                {emailState === "error" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <WarningCircle />
                  </div>
                )}
              </div>
            </div>
            {emailState === "error" && errors.email && (
              <div className="bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden">
                <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                  <p className="text-[#f2f2f2] text-[12px] font-semibold font-sans">
                    {errors.email}
                  </p>
                  <p className="text-[#f2f2f2] text-[10px] font-normal font-sans">
                    That email doesn't seem quite right. Mind taking another
                    look?
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-[16px] items-start relative w-full">
            <div className="flex gap-[8px] items-center relative">
              <p className="text-[#f2f2f2] text-[12px] font-semibold font-sans">
                Password
              </p>
              <button
                type="button"
                onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
                className="relative shrink-0 w-[10px] h-[10px] cursor-pointer hover:opacity-70 transition-opacity duration-200"
              >
                <Info />
              </button>
            </div>
            <div className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] border-2 relative rounded-[8px] w-full transition-all duration-300 ${
              passwordState === "error" 
                ? "border-[#fa8282]" 
                : passwordState === "valid"
                ? "border-[rgba(255,255,255,0.25)]"
                : "border-[rgba(255,255,255,0.15)]"
            }`}>
              <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Choose a password"
                  className="bg-transparent border-none outline-none text-[#f2f2f2] text-[12px] font-semibold font-sans w-full placeholder:text-[#868686] placeholder:opacity-50 transition-opacity duration-200 focus:placeholder:opacity-30"
                />
                {passwordState === "valid" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
                {passwordState === "error" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <WarningCircle />
                  </div>
                )}
              </div>
            </div>
            {showPasswordTooltip && (
              <div className="bg-[rgba(255,255,49,0.25)] border border-[#ffff31] relative rounded-[8px] w-full animate-slide-down overflow-hidden">
                <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                  <div className="flex items-center justify-between relative w-full">
                    <div className="flex gap-[8px] items-center relative">
                      <div className="relative shrink-0 w-[16px] h-[16px] animate-fade-in">
                        <Key />
                      </div>
                      <div className="text-[#f2f2f2] text-[10px] font-sans leading-[1.25]">
                        <p className="font-semibold mb-0">
                          Password must include:
                          <br />
                          <br />
                        </p>
                        <p className="font-normal">
                          • At least 8 characters
                          <br />
                          • Letters and numbers
                          <br />• Optional: symbols or spaces
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswordTooltip(false)}
                      className="relative shrink-0 w-[16px] h-[16px] cursor-pointer hover:opacity-70 transition-opacity duration-200"
                    >
                      <XCircle />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {passwordState === "error" && errors.password && (
              <div className="bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden">
                <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                  <div className="flex flex-col gap-[8px] items-start justify-center leading-none text-[#f2f2f2] font-sans">
                    <p className="text-[12px] font-semibold">
                      {errors.password}
                    </p>
                    <p className="text-[10px] font-normal">
                      The password doesn't meet all the requirements.
                    </p>
                    <p className="text-[10px] font-normal leading-[1.25]">
                      • At least 8 characters
                      <br />
                      • Letters and numbers
                      <br />• Optional: symbols or spaces
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-[16px] items-start relative w-full">
            <p className="text-[#f2f2f2] text-[12px] font-semibold font-sans">
              Confirm Password
            </p>
            <div className={`bg-gradient-to-t from-[rgba(80,80,80,0.2)] to-[rgba(64,64,64,0.2)] border-2 relative rounded-[8px] w-full transition-all duration-300 ${
              confirmPasswordState === "error" 
                ? "border-[#fa8282]" 
                : confirmPasswordState === "valid"
                ? "border-[rgba(255,255,255,0.25)]"
                : "border-[rgba(255,255,255,0.15)]"
            }`}>
              <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  placeholder="Enter your password again"
                  className="bg-transparent border-none outline-none text-[#f2f2f2] text-[12px] font-semibold font-sans w-full placeholder:text-[#868686] placeholder:opacity-50 transition-opacity duration-200 focus:placeholder:opacity-30"
                />
                {confirmPasswordState === "valid" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <Check />
                  </div>
                )}
                {confirmPasswordState === "error" && (
                  <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                    <WarningCircle />
                  </div>
                )}
              </div>
            </div>
            {confirmPasswordState === "error" && errors.confirmPassword && (
              <div className="bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden">
                <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                  <div className="flex flex-col gap-[8px] items-start justify-center leading-none text-[#f2f2f2] font-sans">
                    <p className="text-[12px] font-semibold">
                      Passwords don't match
                    </p>
                    <p className="text-[10px] font-normal">
                      Double-check your password — the two entries must be the
                      same.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="button"
            disabled={!isFormValid()}
            className={`w-full flex items-center justify-between px-[16px] py-[20px] rounded-[8px] transition-all duration-300 ${
              isFormValid()
                ? "bg-[#ffff31] shadow-[8px_8px_64px_0px_rgba(250,250,130,0.25)] cursor-pointer hover:opacity-90 hover:shadow-[8px_8px_64px_0px_rgba(250,250,130,0.35)] text-[#0d0d0d] transform hover:scale-[1.01]"
                : "bg-[rgba(255,255,49,0.4)] cursor-not-allowed text-[#0d0d0d]"
            }`}
          >
            <div className="w-[16px]" />
            <p className="text-[14px] font-semibold font-sans transition-opacity duration-300">Continue</p>
            <div className="relative shrink-0 w-[12px] h-[12px] transition-transform duration-300">
              <CaretRight />
            </div>
          </button>
        </div>

        {/* Login Link */}
        <div className="flex gap-[8px] items-start font-medium text-[12px] font-sans">
          <p className="text-[#999999]">Already have an account? </p>
          <Link href="/login" className="underline text-[#ffff31]">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
