"use client";
import GoogleButton from "@/shared/components/googleButton";
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
  password: string;
};

const Signup = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormData | null>(null);
  const [showOtp, setShowOtp] = useState(false);

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
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const resendOtp = () => {};

  return (
    <div className="w-full py-20 min-h-[85vh] bg-white ">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 text-center ">
        S'inscrire
      </h1>
      <p className="text-center pt-3 text-sm sm:text-lg text-gray-800">
        Accueil &gt; Inscription
      </p>

      <div className="w-full pt-5 flex justify-center">
        <div className="md:w-[480px] p-8 bg-gray-100 shadow rounded-lg  border-gray-100">
          <h3 className="text-sm sm:text-base text-center text-gray-800 font-semibold">
            Bienvenue chez GFASH ! Inscrivez-vous pour découvrir nos offres et
            des boutiques pres de chez vous.
          </h3>
          <div className="flex items-center mt-3 justify-center gap-2">
            <p className="text-gray-500">Avez vous un compte ?</p>
            <Link
              href={"/connexion"}
              className="text-sm sm:text-base font-bold text-purple-900"
            >
              Se connecter
            </Link>
          </div>
          {/* coonnexion with google */}
          <div className="flex items-center mt-3 px-4 py-2 justify-center gap-2 bg-white border border-white h-[40px] rounded cursor-pointer">
            <GoogleButton />
            <span className="text-gray-500 font-medium text-sm sm:text-base">
              Se connecter avec Google
            </span>
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-10">
              {/* name input */}
              <label className="block text-xl mb-1 sm:text-base text-gray-700">
                Nom
              </label>
              <input
                type="text"
                placeholder="John"
                className="w-full border-gray-300 px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
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
                className="w-full border-gray-300 px-3 mt-2 h-[40px] font-medium outline-none rounded-sm"
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
              {/* password input */}
              <label className="block text-xl mt-2 sm:text-base text-gray-700">
                Mot de passe
              </label>
              <div className="relative mt-2">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="votre de passe ici.."
                  className="w-full px-3 h-[40px] font-medium"
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
                  {passwordVisible ? <Eye /> : <EyeOff />}
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
                className={`w-full bg-purple-900 mt-5 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950 ${
                  signupMutation.isPending
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {signupMutation.isPending
                  ? "Inscription en cours..."
                  : "S’inscrire"}
              </button>
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
                    onKeyDown={(e) => handleKeyDown(index, e)}
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
        </div>
      </div>
    </div>
  );
};

export default Signup;
