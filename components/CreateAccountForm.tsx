"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "./Header";
import {
  CaretDown,
  CaretRight,
  Check,
  WarningCircle,
  Info,
  Key,
  XCircle,
  Moon,
  Sun,
} from "./icons";
import { useTheme } from "../contexts/ThemeContext";

type FieldState = "empty" | "valid" | "error";
type Step = 1 | 2;
type IntendedUse =
  | "work"
  | "personal"
  | "education"
  | "collaboration"
  | "mixed-use"
  | null;
type PreferredTheme = "dark" | "light" | null;

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

export default function CreateAccountForm() {
  const { theme, setTheme } = useTheme();
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordTooltip, setShowPasswordTooltip] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
  });

  // Step 2 fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [intendedUse, setIntendedUse] = useState<IntendedUse>(null);
  const [preferredTheme, setPreferredTheme] = useState<PreferredTheme>(null);

  // Input refs for click-to-focus functionality
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const firstNameInputRef = useRef<HTMLInputElement>(null);
  const lastNameInputRef = useRef<HTMLInputElement>(null);

  // Initialize preferredTheme from current theme on mount
  useEffect(() => {
    if (!preferredTheme) {
      setPreferredTheme(theme);
    }
  }, []);

  // Sync preferredTheme with actual theme when theme changes
  useEffect(() => {
    setPreferredTheme(theme);
  }, [theme]);

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

  const isStep1Valid = () => {
    return (
      validateEmail(email) &&
      validatePassword(password) &&
      password === confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

  const isStep2Valid = () => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      intendedUse !== null &&
      preferredTheme !== null &&
      !errors.firstName &&
      !errors.lastName
    );
  };

  const handleFirstNameChange = (value: string) => {
    setFirstName(value);
    setTouched((prev: typeof touched) => ({ ...prev, firstName: true }));

    if (value.trim().length === 0) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        firstName: "First name is required",
      }));
    } else {
      setErrors((prev: FormErrors) => {
        const { firstName, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleLastNameChange = (value: string) => {
    setLastName(value);
    setTouched((prev: typeof touched) => ({ ...prev, lastName: true }));

    if (value.trim().length === 0) {
      setErrors((prev: FormErrors) => ({
        ...prev,
        lastName: "Last name is required",
      }));
    } else {
      setErrors((prev: FormErrors) => {
        const { lastName, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleContinue = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    }
  };

  const handleCreateAccount = () => {
    if (isStep2Valid()) {
      // Handle account creation
      console.log("Creating account with:", {
        email,
        firstName,
        lastName,
        intendedUse,
        preferredTheme,
      });
      // TODO: Implement actual account creation
    }
  };

  const emailState = getEmailState();
  const passwordState = getPasswordState();
  const confirmPasswordState = getConfirmPasswordState();

  return (
    <div className="bg-white dark:bg-[#0d0d0d] box-border flex flex-col gap-[100px] items-center px-[36px] py-[16px] min-h-screen w-full transition-colors duration-300">
      <Header />

      <div className="flex flex-col gap-[64px] items-center max-w-[480px] relative w-full">
        {/* Title Section */}
        <div className="flex flex-col gap-[16px] items-center relative">
          <div className="flex flex-col gap-[17px] items-center">
            <p className="text-[#1a1a1a] dark:text-white text-[24px] text-center font-light font-sans transition-colors duration-300">
              Create an account
            </p>
            <div className="relative shrink-0 w-[16px] h-[16px]">
              <CaretDown
                size={16}
                weight="bold"
                className="text-[#1a1a1a] dark:text-white transition-colors duration-300"
              />
            </div>
          </div>
          {step === 1 ? (
            <h1 className="text-[#1a1a1a] dark:text-white text-center leading-none font-sans transition-colors duration-300">
              <span className="font-medium text-[40px]">{`Lets start with the `}</span>
              <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[44px] font-serif">
                basics
              </span>
              <span className="font-medium text-[40px]">.</span>
            </h1>
          ) : (
            <h1 className="text-[#1a1a1a] dark:text-white text-center leading-[1.5] max-w-[420px] font-sans transition-colors duration-300">
              <span className="font-medium text-[40px]">{`Last few questions to improve your `}</span>
              <span className="bg-gradient-to-r from-[#d4e8a0] via-[#a8d5ba] to-[#5a9c76] bg-clip-text text-transparent italic text-[44px] font-serif">
                experience
              </span>
              <span className="font-medium text-[40px]">.</span>
            </h1>
          )}
        </div>

        {/* Form */}
        {step === 1 ? (
          <div className="flex flex-col gap-[36px] items-start relative w-full">
            {/* Email Field */}
            <div className="flex flex-col gap-[8px] items-start relative w-full">
              <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans transition-colors duration-300">
                Email
              </p>
              <div
                onClick={() => emailInputRef.current?.focus()}
                className={`bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                  emailState === "error"
                    ? "border-[#fa8282]"
                    : emailState === "valid"
                    ? "border-[rgba(26,26,26,0.5)] dark:border-[rgba(255,255,255,0.6)]"
                    : "border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                } focus-within:border-[rgba(26,26,26,0.5)] dark:focus-within:border-[rgba(255,255,255,0.6)]`}
              >
                <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="your@email.com"
                    className="bg-transparent border-none outline-none text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#666666] dark:placeholder:text-[#868686] cursor-text"
                  />
                  {emailState === "valid" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <Check />
                    </div>
                  )}
                  {emailState === "error" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <WarningCircle size={16} weight="bold" color="#fa8282" />
                    </div>
                  )}
                </div>
              </div>
              {emailState === "error" && errors.email && (
                <div className="bg-[#fee2e2] dark:bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                  <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                    <p className="text-[#991b1b] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans transition-colors duration-300">
                      {errors.email}
                    </p>
                    <p className="text-[#991b1b] dark:text-[#f2f2f2] text-[12px] font-normal font-sans transition-colors duration-300">
                      That email doesn't seem quite right. Mind taking another
                      look?
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[8px] items-start relative w-full">
              <div className="flex gap-[8px] items-center relative">
                <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans transition-colors duration-300">
                  Password
                </p>
                <button
                  type="button"
                  onClick={() => setShowPasswordTooltip(!showPasswordTooltip)}
                  className="relative shrink-0 w-[16px] h-[16px] cursor-pointer hover:opacity-70 transition-opacity duration-200 flex items-center justify-center"
                >
                  <Info
                    size={16}
                    weight="bold"
                    className="text-[#1a1a1a] dark:text-[#f2f2f2]"
                  />
                </button>
              </div>
              <div
                onClick={() => passwordInputRef.current?.focus()}
                className={`bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                  passwordState === "error"
                    ? "border-[#fa8282]"
                    : passwordState === "valid"
                    ? "border-[rgba(26,26,26,0.5)] dark:border-[rgba(255,255,255,0.6)]"
                    : "border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                } focus-within:border-[rgba(26,26,26,0.5)] dark:focus-within:border-[rgba(255,255,255,0.6)]`}
              >
                <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Choose a password"
                    className="bg-transparent border-none outline-none text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#666666] dark:placeholder:text-[#868686] cursor-text"
                  />
                  {passwordState === "valid" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <Check />
                    </div>
                  )}
                  {passwordState === "error" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <WarningCircle size={16} weight="bold" color="#fa8282" />
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
                          <Key size={16} weight="bold" />
                        </div>
                        <div className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[12px] font-sans leading-[1.25] transition-colors duration-300">
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
                        <XCircle size={16} weight="bold" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {passwordState === "error" && errors.password && (
                <div className="bg-[#fee2e2] dark:bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                  <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                    <div className="flex flex-col gap-[8px] items-start justify-center leading-none text-[#991b1b] dark:text-[#f2f2f2] font-sans transition-colors duration-300">
                      <p className="text-[14px] font-semibold">
                        {errors.password}
                      </p>
                      <p className="text-[12px] font-normal">
                        The password doesn't meet all the requirements.
                      </p>
                      <p className="text-[12px] font-normal leading-[1.25]">
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
            <div className="flex flex-col gap-[8px] items-start relative w-full">
              <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans transition-colors duration-300">
                Confirm Password
              </p>
              <div
                onClick={() => confirmPasswordInputRef.current?.focus()}
                className={`bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                  confirmPasswordState === "error"
                    ? "border-[#fa8282]"
                    : confirmPasswordState === "valid"
                    ? "border-[rgba(26,26,26,0.5)] dark:border-[rgba(255,255,255,0.6)]"
                    : "border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                } focus-within:border-[rgba(26,26,26,0.5)] dark:focus-within:border-[rgba(255,255,255,0.6)]`}
              >
                <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                  <input
                    ref={confirmPasswordInputRef}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleConfirmPasswordChange(e.target.value)
                    }
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter your password again"
                    className="bg-transparent border-none outline-none text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#666666] dark:placeholder:text-[#868686] cursor-text"
                  />
                  {confirmPasswordState === "valid" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <Check />
                    </div>
                  )}
                  {confirmPasswordState === "error" && (
                    <div className="relative shrink-0 w-[16px] h-[16px] animate-scale-in">
                      <WarningCircle size={16} weight="bold" color="#fa8282" />
                    </div>
                  )}
                </div>
              </div>
              {confirmPasswordState === "error" && errors.confirmPassword && (
                <div className="bg-[#fee2e2] dark:bg-[#a34646] border border-[#fa8282] relative rounded-[8px] w-full animate-slide-down overflow-hidden transition-colors duration-300">
                  <div className="flex flex-col gap-[8px] items-start px-[16px] py-[8px] relative rounded-[inherit] w-full">
                    <div className="flex flex-col gap-[8px] items-start justify-center leading-none text-[#991b1b] dark:text-[#f2f2f2] font-sans transition-colors duration-300">
                      <p className="text-[14px] font-semibold">
                        Passwords don't match
                      </p>
                      <p className="text-[12px] font-normal">
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
              onClick={handleContinue}
              disabled={!isStep1Valid()}
              className={`w-full flex items-center justify-between px-[16px] py-[20px] rounded-[8px] transition-all duration-300 ${
                isStep1Valid()
                  ? "bg-[#ffff31] shadow-[8px_8px_64px_0px_rgba(250,250,130,0.25)] cursor-pointer hover:opacity-90 hover:shadow-[8px_8px_64px_0px_rgba(250,250,130,0.35)] text-[#0d0d0d] transform hover:scale-[1.01]"
                  : "bg-[rgba(255,255,49,0.4)] cursor-not-allowed text-[#0d0d0d]"
              }`}
            >
              <div className="w-[16px]" />
              <p className="text-[16px] font-semibold font-sans transition-opacity duration-300">
                Continue
              </p>
              <div className="relative shrink-0 w-[16px] h-[16px] transition-transform duration-300">
                <CaretRight size={16} weight="bold" />
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-[64px] items-start relative w-full">
            {/* First Name and Last Name Fields */}
            <div className="flex gap-[16px] items-start justify-center relative w-full">
              <div className="basis-0 flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative">
                <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[12px] font-semibold font-sans text-center transition-colors duration-300">
                  First name
                </p>
                <div
                  onClick={() => firstNameInputRef.current?.focus()}
                  className={`bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                    errors.firstName
                      ? "border-[#fa8282]"
                      : firstName.trim().length > 0
                      ? "border-[rgba(26,26,26,0.5)] dark:border-[rgba(255,255,255,0.6)]"
                      : "border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                  } focus-within:border-[rgba(26,26,26,0.5)] dark:focus-within:border-[rgba(255,255,255,0.6)]`}
                >
                  <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                    <input
                      ref={firstNameInputRef}
                      type="text"
                      value={firstName}
                      onChange={(e) => handleFirstNameChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Jane"
                      className="bg-transparent border-none outline-none text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#666666] dark:placeholder:text-[#868686] cursor-text"
                    />
                  </div>
                </div>
              </div>
              <div className="basis-0 flex flex-col gap-[8px] grow items-start min-h-px min-w-px relative">
                <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[12px] font-semibold font-sans text-center transition-colors duration-300">
                  Last name
                </p>
                <div
                  onClick={() => lastNameInputRef.current?.focus()}
                  className={`bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] backdrop-blur-sm border relative rounded-[8px] w-full transition-all duration-300 cursor-pointer ${
                    errors.lastName
                      ? "border-[#fa8282]"
                      : lastName.trim().length > 0
                      ? "border-[rgba(26,26,26,0.5)] dark:border-[rgba(255,255,255,0.6)]"
                      : "border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                  } focus-within:border-[rgba(26,26,26,0.5)] dark:focus-within:border-[rgba(255,255,255,0.6)]`}
                >
                  <div className="flex items-center justify-between p-[16px] relative rounded-[inherit] w-full">
                    <input
                      ref={lastNameInputRef}
                      type="text"
                      value={lastName}
                      onChange={(e) => handleLastNameChange(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Doe"
                      className="bg-transparent border-none outline-none text-[#1a1a1a] dark:text-[#f2f2f2] text-[14px] font-semibold font-sans w-full placeholder:text-[#666666] dark:placeholder:text-[#868686] cursor-text"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Intended Use Selection */}
            <div className="flex flex-col gap-[16px] items-center relative w-full">
              <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[12px] font-semibold font-sans text-center transition-colors duration-300">
                What best describes your intended use
              </p>
              <div className="flex gap-[8px] items-start relative flex-wrap">
                {(
                  [
                    "work",
                    "personal",
                    "education",
                    "collaboration",
                    "mixed-use",
                  ] as const
                ).map((use) => (
                  <button
                    key={use}
                    type="button"
                    onClick={() => setIntendedUse(use)}
                    className={`border relative rounded-[8px] backdrop-blur-sm transition-all duration-300 ${
                      intendedUse === use
                        ? "bg-[rgba(255,255,49,0.2)] border-[rgba(255,255,49,0.75)]"
                        : "bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                    }`}
                  >
                    <div className="flex gap-[8px] items-center p-[16px] relative rounded-[inherit]">
                      <p
                        className={`text-[14px] font-semibold font-sans text-center whitespace-nowrap transition-colors duration-300 ${
                          intendedUse === use
                            ? "text-[#1a1a1a] dark:text-white"
                            : "text-[#666666] dark:text-[#999999]"
                        }`}
                      >
                        {use === "mixed-use"
                          ? "Mixed use"
                          : use.charAt(0).toUpperCase() + use.slice(1)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selection */}
            <div className="flex flex-col gap-[16px] items-center relative w-full">
              <p className="text-[#1a1a1a] dark:text-[#f2f2f2] text-[12px] font-semibold font-sans text-center transition-colors duration-300">
                Select your preferred theme
              </p>
              <div className="flex gap-[8px] items-start relative">
                <button
                  type="button"
                  onClick={() => {
                    const newTheme = "dark";
                    setPreferredTheme(newTheme);
                    setTheme(newTheme);
                    // Force immediate application
                    if (typeof window !== "undefined") {
                      document.documentElement.classList.add("dark");
                    }
                  }}
                  className={`border relative rounded-[8px] backdrop-blur-sm transition-all duration-300 ${
                    preferredTheme === "dark"
                      ? "bg-[rgba(255,255,49,0.2)] border-[rgba(255,255,49,0.75)]"
                      : "bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                  }`}
                >
                  <div className="flex gap-[8px] items-center p-[16px] relative rounded-[inherit]">
                    <div
                      className={`relative shrink-0 w-[16px] h-[16px] transition-colors duration-300 ${
                        preferredTheme === "dark"
                          ? "text-[#1a1a1a] dark:text-white"
                          : "text-[#666666] dark:text-[#999999]"
                      }`}
                    >
                      <Moon size={16} weight="bold" />
                    </div>
                    <p
                      className={`text-[14px] font-semibold font-sans text-center transition-colors duration-300 ${
                        preferredTheme === "dark"
                          ? "text-[#1a1a1a] dark:text-white"
                          : "text-[#666666] dark:text-[#999999]"
                      }`}
                    >
                      Dark mode
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTheme = "light";
                    setPreferredTheme(newTheme);
                    setTheme(newTheme);
                    // Force immediate application
                    if (typeof window !== "undefined") {
                      document.documentElement.classList.remove("dark");
                    }
                  }}
                  className={`border relative rounded-[8px] backdrop-blur-sm transition-all duration-300 ${
                    preferredTheme === "light"
                      ? "bg-[rgba(255,255,49,0.2)] border-[rgba(255,255,49,0.75)]"
                      : "bg-gradient-to-t from-[rgba(240,240,240,0.8)] to-[rgba(250,250,250,0.8)] dark:from-[rgba(80,80,80,0.2)] dark:to-[rgba(64,64,64,0.2)] border-[rgba(26,26,26,0.25)] dark:border-[rgba(194,194,194,0.25)]"
                  }`}
                >
                  <div className="flex gap-[8px] items-center p-[16px] relative rounded-[inherit]">
                    <div
                      className={`relative shrink-0 w-[16px] h-[16px] transition-colors duration-300 ${
                        preferredTheme === "light"
                          ? "text-[#1a1a1a] dark:text-white"
                          : "text-[#666666] dark:text-[#999999]"
                      }`}
                    >
                      <Sun size={16} weight="bold" />
                    </div>
                    <p
                      className={`text-[14px] font-semibold font-sans text-center transition-colors duration-300 ${
                        preferredTheme === "light"
                          ? "text-[#1a1a1a] dark:text-white"
                          : "text-[#666666] dark:text-[#999999]"
                      }`}
                    >
                      Light mode
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="button"
              onClick={handleCreateAccount}
              disabled={!isStep2Valid()}
              className={`w-full flex items-center justify-center px-[16px] py-[16px] rounded-[8px] transition-all duration-300 ${
                isStep2Valid()
                  ? "bg-[#ffff31] shadow-[8px_8px_64px_0px_rgba(250,250,130,0.25)] cursor-pointer hover:opacity-90 hover:shadow-[8px_8px_64px_0px_rgba(250,250,130,0.35)] text-[#0d0d0d] transform hover:scale-[1.01]"
                  : "bg-[rgba(255,255,49,0.4)] cursor-not-allowed text-[#0d0d0d]"
              }`}
            >
              <p className="text-[16px] font-bold font-sans">Create account</p>
            </button>
          </div>
        )}

        {/* Login Link */}
        <div className="flex gap-[8px] items-start font-medium text-[14px] font-sans">
          <p className="text-[#666666] dark:text-[#999999] transition-colors duration-300">
            Already have an account?{" "}
          </p>
          <Link
            href="/login"
            className="underline text-[#ffff31] transition-colors duration-300"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
