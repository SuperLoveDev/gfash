"use client";
import GoogleButton from "@/shared/components/googleButton";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <div className="w-full py-20 min-h-[85vh] bg-white ">
      <h1 className="text-3xl sm:text-4xl font-semibold text-gray-800 text-center ">
        Se connecter
      </h1>
      <p className="text-center pt-3 text-sm sm:text-lg text-gray-800">
        Accueil &gt; Connexion
      </p>

      <div className="w-full pt-5 flex justify-center">
        <div className="md:w-[480px] p-8 bg-gray-100 shadow rounded-lg  border-gray-100">
          <h3 className="text-sm sm:text-base text-center text-gray-800 font-semibold">
            Bienvenue chez GFASH ! Connectez-vous pour découvrir nos offres
          </h3>
          <div className="flex items-center mt-3 justify-center gap-2">
            <p className="text-gray-500">Vous n'avez pas de compte ?</p>
            <Link
              href={"/signup"}
              className="text-sm sm:text-base font-bold text-purple-900"
            >
              S'inscrire
            </Link>
          </div>
          {/* coonnexion with google */}
          <div className="flex items-center mt-3 px-4 py-2 justify-center gap-2 bg-white border border-white h-[40px] rounded cursor-pointer">
            <GoogleButton />
            <span className="text-gray-500 font-medium text-sm sm:text-base">
              Se connecter avec Google
            </span>
          </div>

          <div className="flex items-center justify-center my-5  text-gray-200 text-sm">
            <span className="text-lg sm:text-base font-medium text-gray-800">
              Se connecter avec email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* email input */}
            <label className="block text-xl mb-1 sm:text-base text-gray-700">
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

            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                se souvenir
              </label>

              <Link
                href={"/mot-de-passe-oublie"}
                className="text-purple-900 font-bold text-sm sm:text-base"
              >
                Mot de passe oublié
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-900 mt-5 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950"
            >
              Connexion
            </button>

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
