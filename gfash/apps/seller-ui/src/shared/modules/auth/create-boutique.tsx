"use client";

import boutiqueCategories from "@/utils/boutiqueCategory";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";

const CreateBoutique = ({
  sellerId,
  setActiveStep,
}: {
  sellerId: string;
  setActiveStep: (step: number) => void;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const countWords = (text: string) => {
    return text.trim().split(/\s+/).length;
  };

  const createBoutiqueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/creation-boutique`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      setActiveStep(3);
    },
    onError: (error: any) => console.error("Erreur creation boutique:", error),
  });

  const onSubmit = async (data: any) => {
    const boutiqueData = { ...data, sellerId };
    createBoutiqueMutation.mutate(boutiqueData);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="h-[85vh]">
        <h3 className="text-center text-xl sm:text-3xl mb-8 text-gray-700 font-medium">
          Configuration Boutique
        </h3>

        {/* name input */}
        <label className="block text-base mt-3 sm:text-sm text-gray-700">
          Nom*
        </label>
        <input
          type="text"
          placeholder="John"
          className="w-full border border-gray-400 rounded-xl p-6 px-3 mt-2 h-[40px] font-medium outline-none"
          {...register("name", {
            required: "Votre nom est requis !",
          })}
        />
        {errors.name && (
          <p className="text-red-500 text-sm">{String(errors.name.message)}</p>
        )}

        {/* bio input */}
        <label className="block text-base mt-3 sm:text-sm text-gray-700">
          Bio*
        </label>
        <input
          type="text"
          placeholder="Bio boutique"
          className="w-full border border-gray-400 rounded-xl p-6 px-3 mt-2 h-[40px] font-medium outline-none"
          {...register("bio", {
            required: "Votre Bio est requise pour être mieux référencé !",
            validate: (value) =>
              countWords(value) <= 120 ||
              "Votre bio ne peut pas dépasser 120 mots",
          })}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm">{String(errors.bio.message)}</p>
        )}

        {/* Address boutique */}
        <label className="block text-base mt-3 sm:text-sm text-gray-700">
          Adresse*
        </label>
        <input
          type="text"
          placeholder="Localisation boutique"
          className="w-full border border-gray-400 rounded-xl p-6 px-3 mt-2 h-[40px] font-medium outline-none"
          {...register("address", {
            required: "Veuillez indiquer la localisation de votre boutique !",
          })}
        />
        {errors.address && (
          <p className="text-red-500 text-sm">
            {String(errors.address.message)}
          </p>
        )}

        {/* opening hour input */}
        <label className="block text-base mt-3 sm:text-sm text-gray-700">
          Heure d'ouverture*
        </label>
        <input
          type="text"
          placeholder="Ex: 00h00 - 00h00"
          className="w-full border border-gray-400 rounded-xl p-6 px-3 mt-2 h-[40px] font-medium outline-none"
          {...register("opening_hours", {
            required: "Veuillez indiquer vos horaires d’ouverture.",
          })}
        />
        {errors.opening_hours && (
          <p className="text-red-500 text-sm">
            {String(errors.opening_hours.message)}
          </p>
        )}

        {/* website input */}
        <label className="block text-base mt-3 sm:text-sm text-gray-700">
          Vos Réseaux
        </label>
        <input
          type="text"
          placeholder="http://exemple.com"
          className="w-full border border-gray-400 rounded-xl p-6 px-3 mt-2 h-[40px] font-medium outline-none"
          {...register("website", {
            pattern: {
              value:
                /^(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
              message: "Entrer un URL valide",
            },
          })}
        />
        {errors.website && (
          <p className="text-red-500 text-sm">
            {String(errors.website.message)}
          </p>
        )}

        {/* boutique category */}
        <label className="block text-xl mt-3 sm:text-base text-gray-700">
          Catégorie*
        </label>
        <select
          {...register("category", {
            required: "La catégorie est requise !",
          })}
          className="w-full border border-gray-400 rounded-xl mt-2 p-6 px-3 h-[40px] text-black font-medium outline-none"
        >
          <option value="">Sélectionnez une catégorie</option>
          {boutiqueCategories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm">
            {String(errors.category.message)}
          </p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center bg-purple-900 mt-10 h-[40px] text-white font-medium text-base sm:text-lg cursor-pointer transition-all duration-300 hover:bg-purple-950 rounded-xl p-6"
        >
          Créer Ma Boutique
        </button>
      </form>
    </div>
  );
};

export default CreateBoutique;
