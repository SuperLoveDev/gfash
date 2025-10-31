"use client";

import PaymentLogo from "@/assets/svgs/payment-logo";
import CreateBoutique from "@/shared/modules/auth/create-boutique";
import { countries } from "@/utils/countries";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../../../packages/input";

// type FormData = {
//   name: string;
//   email: string;
//   phone_number: string;
//   country: string;
//   password: string;
// };

const Page = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<FormData | null>(null);
  const [sellerId, setSellerId] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone_numberRegex =
    /^(\+?[1-9][0-9]{0,3}[-.\s]?)?([0-9][-.\s]?){7,15}$/;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/inscription-vendeur`,
        data
      );
      return response.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendOtp();
    },
  });

  // otp verification and redirection to the login page
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verification-vendeur`,
        {
          ...sellerData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setSellerId(data?.seller?.id);
      setActiveStep(2);
    },
  });

  // form handler
  const onSubmit = (data: any) => {
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

  // resend otp function when OTP expires
  const resendOtp = () => {
    if (sellerData) {
      signupMutation.mutate(sellerData);
    }
  };

  // paystack boutique or vendor function
  const connectPaystack = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/creer-paystack-lien`,
        { sellerId }
      );

      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-10 bg-slate-800">
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
                  : "bg-white text-black"
              }`}
            >
              {step}
            </div>

            <span className="mt-2 text-xs sm:text-sm text-gray-700 font-bold max-w-[90px]">
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
      <div className="w-full h-[100vh] md:w-[520px] mt-5 px-4 sm:px-8 rounded-lg">
        {activeStep === 1 && (
          <>
            {!showOtp ? (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-5">
                <h3 className="text-center mb-8 font-medium text-2xl sm:text-4xl text-gray-300">
                  Creer Mon Compte
                </h3>
                {/* name input */}
                <Input
                  label="Nom et prénom"
                  placeholder="Jean Monroe"
                  className="bg-transparent"
                  {...register("name", {
                    required: "Nom et prenom sont requis",
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 italic text-sm">
                    {String(errors.name.message)}
                  </p>
                )}

                {/* email input */}
                <div className="mt-2">
                  <Input
                    label="Email"
                    placeholder="gfash@gmail.com"
                    className="bg-transparent mb-1"
                    {...register("email", {
                      required: "L'Email est requis",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Address email invalide",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 italic text-sm">
                      {String(errors.email.message)}
                    </p>
                  )}
                </div>

                {/* phone_number input */}
                <div className="mt-2">
                  <Input
                    label="Numero Telephone"
                    placeholder="+000000000"
                    className="bg-transparent mb-1"
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
                    <p className="text-red-500 italic text-sm">
                      {String(errors.phone_number.message)}
                    </p>
                  )}
                </div>

                {/* country input */}
                <div className="mt-2 font-Poppins">
                  <label className="block text-gray-300 text-base font-medium mb-1">
                    Pays
                  </label>
                  <select
                    className="w-full border-2 border-gray-400 rounded-md p-3 text-white bg-transparent outline-none"
                    {...register("country", {
                      required: "Votre pays est requis!",
                    })}
                  >
                    <option value="" className="text-gray-600">
                      Sélectionnez votre pays
                    </option>
                    {countries.map((nation) => (
                      <option
                        key={nation.code}
                        value={nation.code}
                        className="text-black"
                      >
                        {nation.name}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 italic text-sm mt-1">
                      {String(errors.country.message)}
                    </p>
                  )}
                </div>

                {/* password input */}
                <div className="relative mt-2">
                  <Input
                    label="Mot de passe"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="......"
                    className="bg-transparent mb-1 "
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
                    className="absolute inset-y-0 top-5 right-3 flex items-center text-gray-400"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <Eye color="white" />
                    ) : (
                      <EyeOff color="white" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="text-red-500 italic text-sm">
                      {String(errors.password.message)}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className={`w-full flex items-center justify-center bg-purple-900 mt-10 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950 rounded-xl p-6 ${
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

                <p className="text-sm sm:text-base mt-5 text-gray-200 text-center font-medium">
                  Avez-vous déja un compte ?
                  <Link
                    href={"/connexion"}
                    className="text-purple-600 text-bold text-base sm:text-lg font-medium ml-1"
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

        {activeStep === 2 && (
          <CreateBoutique sellerId={sellerId} setActiveStep={setActiveStep} />
        )}

        {/* payment setup */}
        {activeStep === 3 && (
          <div className="text-center">
            <h3 className="text-2xl font-semibold">Retrait Fond</h3>
            <br />
            <button
              className="w-full flex justify-center items-center bg-purple-600 text-white h-[40px] p-8 text-sm sm:text-lg font-medium cursor-pointer"
              onClick={connectPaystack}
            >
              Connceter Mon Compte Paiement
              <PaymentLogo />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
