"use client";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type FormData = {
  email: string;
  password: string;
};

const ForgotPassword = () => {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [canResend, setCanResend] = useState(true);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // verifying the otp to modify the password
  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verif-mdp-utili-oublie`,
        { email: userEmail, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: () => {
      setStep("reset");
      setServerError(null);
    },
    onError: (error: AxiosError) => {
      const messageError =
        (error.response?.data as { message?: string })?.message ||
        "OTP incorrect. Veuillez ressayer";
      setServerError(messageError);
    },
  });

  // otp request for forgot-password
  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/mot-de-passe-utili-oublie`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const messageError =
        (error.response?.data as { message?: string })?.message ||
        "OTP incorrect. Veuillez ressayer";
      setServerError(messageError);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-user-password`,
        { email: userEmail, newPassword: password }
      );
      return response.data;
    },
    onSuccess: (_, {}) => {
      setStep("email");
      toast.success(
        "Password reset successfully! please login with your new password"
      );
      setServerError(null);
      router.push("/connexion");
    },
  });

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

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutation.mutate({ email });
  };

  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  return (
    <div className="w-full py-20 min-h-[85vh] bg-white ">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 text-center ">
        Mot de pass oublié
      </h1>
      <p className="text-center pt-3 text-sm sm:text-lg text-gray-800">
        Accueil &gt; Mot de passe oublié
      </p>

      <div className="w-full pt-5 flex justify-center">
        <div className="md:w-[480px] p-8 bg-gray-100 shadow rounded-lg  border-gray-100">
          {step === "email" && (
            <>
              <div className="flex flex-col items-center mt-3 gap-2">
                <h3 className="font-semibold text-lg sm:text-lg md:text-base">
                  Acceder a mon compte Gfash
                </h3>
                <p className="text-gray-500 text-xs">
                  Retour à la connexion
                  <Link
                    href={"/connexion"}
                    className="text-sm ml-1 sm:text-base font-bold text-purple-900"
                  >
                    Se connecter
                  </Link>
                </p>
              </div>

              {/* form validation */}
              <form onSubmit={handleSubmit(onSubmitEmail)}>
                {/* email input */}
                <label className="block text-base mt-4 sm:text-base text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="gfash@gmail.com"
                  className="w-full border-gray-300 px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
                  {...register("email", {
                    required: "Votre email est requis !",
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full bg-purple-900 mt-5 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950"
                >
                  {requestOtpMutation.isPending
                    ? "Envoi en cours..."
                    : "Envoyer le code"}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
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
                    onClick={() =>
                      requestOtpMutation.mutate({ email: userEmail! })
                    }
                  >
                    Resend OTP
                  </p>
                ) : (
                  `Resend OTP - ${timer}s`
                )}
              </div>

              {serverError && (
                <p className="text-red-500 text-sm mt-2">{serverError}</p>
              )}
            </div>
          )}

          {step === "reset" && (
            <form
              onSubmit={handleSubmit(onSubmitPassword)}
              className="flex flex-col gap-4"
            >
              <div>
                <label
                  htmlFor="password"
                  className="block text-lg sm:text-base text-gray-700 font-medium mb-1"
                >
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type="password"
                    placeholder="Entrez votre nouveau mot de passe..."
                    className="w-[400px] sm:w-full px-3 h-[40px] rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    {...register("password", {
                      required: "Le mot de passe est obligatoire",
                      minLength: {
                        value: 6,
                        message:
                          "Le mot de passe doit contenir au moins 6 caractères",
                      },
                    })}
                  />

                  <button
                    type="submit"
                    disabled={resetPasswordMutation.isPending}
                    className={`absolute inset-y-0 right-2 px-3 text-sm font-semibold rounded-md text-white transition ${
                      resetPasswordMutation.isPending
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-purple-700 hover:bg-purple-800"
                    }`}
                  >
                    {resetPasswordMutation.isPending
                      ? "Réinitialisation..."
                      : "Réinitialiser"}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
