"use client";

import countries from "@/utils/countries";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  name: string;
  email: string;
  phone_number: string;
  country: string;
  password: string;
};

const Signup = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const [showOtp, setShowOtp] = useState(false);

  const phone_numberRegex =
    /^(\+?[1-9][0-9]{0,3}[-.\s]?)?([0-9][-.\s]?){7,15}$/;

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendOtp = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev < 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // user signuup and otp trigger on success
  const signupMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/inscription-utilisateur`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendOtp();
    },
  });

  // otp verification and redirection to the login page
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verification-utilisateur`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/connexion");
    },
  });

  // form handler
  const onSubmit = (data: FormData) => {
    signupMutation.mutate(data);
  };

  // OTP input change
  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // function to handle otp automatic deletion
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 min-h-screen">
      {/* Stepper */}
      <div className="relative flex sm:flex-row items-center justify-between w-[90%] sm:w-[70%] md:w-[50%] mb-8 gap-6 sm:gap-0">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            className="flex flex-col sm:flex-col items-center justify-center text-center"
          >
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                step <= activeStep
                  ? "bg-purple-900 text-white"
                  : "bg-black text-gray-50"
              }`}
            >
              {step}
            </div>

            <span className="mt-2 text-xs sm:text-sm text-gray-700 font-medium max-w-[90px]">
              {step === 1
                ? "Créer un compte"
                : step === 2
                ? "Configurer la boutique"
                : "Compte & Paiement"}
            </span>
          </div>
        ))}
      </div>

      {/* steps content */}
      <div className="w-[90%] md:w-[480px] p-8 mt-10 px-4 sm:px-8 shadow-2xl rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
                <h3 className="text-center mb-8 font-medium text-2xl sm:text-4xl">
                  Creer Mon Compte
                </h3>
                {/* name input */}
                <label className="block text-xl mb-1 sm:text-base text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full border border-purple-800 shadow px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
                  {...register("name", {
                    required: "Votre nom est requis !",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

                {/* email input */}
                <label className="block text-xl mt-1 sm:text-base text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="gfash@gmail.com"
                  className="w-full border border-purple-800 shadow px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Address email invalide",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">
                    {String(errors.email.message)}
                  </p>
                )}

                {/* phone_number input */}
                <label className="block text-xl mt-1 sm:text-base text-gray-700">
                  Numero Telephone
                </label>
                <input
                  type="teL"
                  placeholder="+0000000000"
                  className="w-full border border-purple-800 shadow px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
                  {...register("phone_number", {
                    required: "Votre numero telephone est requis",
                    pattern: {
                      value: phone_numberRegex,
                      message: "Format numero invalide",
                    },
                    maxLength: {
                      value: 20,
                      message: "Le numéro ne doit pas dépasser 20 caractères",
                    },
                    minLength: {
                      value: 8,
                      message: "Numéro trop court (min 8 chiffres)",
                    },
                  })}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm">
                    {String(errors.phone_number.message)}
                  </p>
                )}

                {/* country input */}
                <label className="block text-xl mt-2 sm:text-base text-gray-700">
                  Pays
                </label>
                <select
                  {...register("country", {
                    required: "Votre pays est requis!",
                  })}
                  className="w-full border border-purple-800 shadow px-3 h-[40px] text-black font-medium outline-none"
                >
                  <option value="">Sélectionnez votre pays</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {errors.country.message}
                  </p>
                )}

                {/* password input */}
                <label className="block text-xl mt-2 sm:text-base text-gray-700">
                  Mot de passe
                </label>
                <div className="relative mt-2">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    placeholder="votre de passe ici.."
                    className="w-full border border-purple-800 shadow px-3 h-[40px] text-black font-medium outline-none"
                    {...register("password", {
                      required: "password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <Eye color="black" />
                    ) : (
                      <EyeOff color="black" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className={`w-full bg-purple-900 mt-10 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950 ${
                    signupMutation.isPending
                      ? "opacity-70 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {signupMutation.isPending
                    ? "Creation boutique en cours..."
                    : "Creer ma Boutique"}
                </button>

                {signupMutation?.isError &&
                  signupMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {signupMutation.error.response?.data?.message ||
                        signupMutation.error.message}
                    </p>
                  )}

                <p className="text-sm sm:text-base mt-5 text-black text-center">
                  Avez-vous déja un compte ?
                  <Link
                    href={"/connexion"}
                    className="text-black text-bold text-base sm:text-lg font-medium ml-1"
                  >
                    Connexion
                  </Link>
                </p>
              </form>
            ) : (
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-center mb-5">
                  Entrez le CODE de vérification
                </h3>

                <div className="flex justify-center gap-6 ">
                  {otp?.map((digit, index) => (
                    <input
                      className="w-12 h-12 text-center rounded-sm border-2 border-purple-700 outline-none"
                      type="text"
                      key={index}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      maxLength={1}
                      ref={(el) => {
                        if (el) inputRefs.current[index] = el;
                      }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  onClick={() => verifyOtpMutation.mutate()}
                  className="w-full mt-4 border bg-purple-900 p-2 text-white font-medium text-base sm:text-xl rounded-sm cursor-pointer"
                >
                  {verifyOtpMutation.isPending
                    ? "Vérification..."
                    : "Vérifier le code OTP"}
                </button>

                <div className="flex mt-4 items-center justify-center">
                  {canResend ? (
                    <p
                      className="text-center text-purple-900 font-medium text-sm cursor-pointer"
                      onClick={resendOtp}
                    >
                      Resend OTP
                    </p>
                  ) : (
                    `Resend OTP - ${timer}s`
                  )}
                </div>

                {verifyOtpMutation?.isError &&
                  verifyOtpMutation.error instanceof AxiosError && (
                    <p className="text-red-500 text-sm mt-2">
                      {verifyOtpMutation.error.response?.data?.message ||
                        verifyOtpMutation.error.message}
                    </p>
                  )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
