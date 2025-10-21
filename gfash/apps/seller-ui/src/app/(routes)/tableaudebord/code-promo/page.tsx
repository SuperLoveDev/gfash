"use client";

import axiosInstance from "@/utils/axiosinstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Plus, Trash, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../../../../../../packages/input";

const Page = () => {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: promoCode = [], isLoading } = useQuery({
    queryKey: ["boutique-promo"],
    queryFn: async () => {
      const response = await axiosInstance.get("/produit/api/code-promo");
      return response?.data?.code_promo || [];
    },
  });

  // function to prevent more than 8 promo codes
  const onSubmit = (data: any) => {
    if (promoCode.length >= 8) {
      toast.error("Vous pouvez unique créer que 8 code promo");
    }
    promoCodeMutation.mutate(data);
  };

  // formdata
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      public_name: "",
      discountType: "percentage",
      discountValue: "",
      discountCode: "",
    },
  });

  const promoCodeMutation = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.post("/produit/api/creer-code-promo", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutique-promo"] });
      reset();
      setShowModal(false);
      toast.success("Code promo créé avec succès");
    },
  });

  // delete a promo code
  const handleDeleteClick = async (promo: string) => {};

  return (
    <div className="w-full p-8 rounded-lg font-Poppins">
      <div className="flex justify-between items-center mb-1">
        <h1 className="font-Poppins font-semibold text-base sm:text-2xl">
          Code Promo
        </h1>
        <button
          type="button"
          className=" bg-purple-600 hover:bg-purple-900 flex items-center gap-1 sm:gap-2 text-gray-300 text-center px-2 py-1 sm:px-4 sm:py-2 rounded-md cursor-pointer text-sm sm:text-base font-semibold"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          <span className="hidden sm:inline font-bold hover:bg-purple-900">
            Créer code Promo
          </span>
          <span className="sm:hidden font-bold hover:bg-purple-900">Créer</span>
        </button>
      </div>

      {/* breadcrum */}
      <div className="w-full flex items-center my-7">
        <Link
          href={"/tableaudebord"}
          className="text-purple-500 text-base font-Poppins"
        >
          Tableau de bord
        </Link>
        <ChevronRight size={16} />
        <span className="font-Poppins text-base">créer code promo</span>
      </div>

      <div className="mt-8 bg-slate-600 p-2 sm:p-6 text-sm sm:text-xl shadow-lg rounded-md">
        <h3 className="mb-1 sm:mb-4 text-gray-200 text-base sm:text-xl">
          Mon code promo
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">
            Chargement du code promo en cours....
          </p>
        ) : (
          <table className="hidden sm:table w-full text-gray-300">
            <thead className="table-header-group border-b border-gray-700">
              <tr>
                <th className="p-3 text-left">Nom</th>
                <th className="p-3 text-left">Type de réduction</th>
                <th className="p-3 text-left">Montant</th>
                <th className="p-3 text-left">Code promo</th>
                <th className="p-3 text-left">Opérations</th>
              </tr>
            </thead>
            <tbody>
              {promoCode?.map((promo: any) => (
                <tr key={promo.id} className="border-b border-gray-700">
                  <td className="p-3">{promo.public_name}</td>
                  <td className="p-3 capitalize">
                    {promo.discountType === "percentage"
                      ? "Percentage(%)"
                      : "Remise forfaitaire (cfa)"}
                  </td>
                  <td className="p-3">
                    {promo.discountType === "percentage"
                      ? `${promo.discountValue}%`
                      : `${promo.discountValue}`}
                  </td>
                  <td className="p-3">{promo.discountCode}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(promo)}
                      className="text-red-500 hover:text-red-300 transition"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="sm:hidden flex flex-col gap-4">
          {promoCode?.map((promo: any) => (
            <div
              key={promo.id}
              className="bg-gray-800 p-4 rounded-xl shadow-md flex flex-col gap-2"
            >
              <div>
                <span className="font-semibold">Nom :</span> {promo.public_name}
              </div>
              <div>
                <span className="font-semibold">Type de réduction :</span>{" "}
                {promo.discountType === "percentage"
                  ? "Percentage(%)"
                  : "Remise forfaitaire (cfa)"}
              </div>
              <div>
                <span className="font-semibold">Montant :</span>{" "}
                {promo.discountType === "percentage"
                  ? `${promo.discountValue}%`
                  : `${promo.discountValue}`}
              </div>
              <div>
                <span className="font-semibold">Code promo :</span>{" "}
                {promo.discountCode}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteClick(promo)}
                  className="text-red-500 hover:text-red-300 transition"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isLoading && promoCode?.length === 0 && (
          <p className="text-gray-400 block w-full pt-4 text-center">
            Aucun code promo disponible
          </p>
        )}
      </div>

      {/* create promocode modal */}
      {showModal && (
        <div className="top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-slate-700 p-4 sm:p-6 rounded-lg w-[320px] sm:w-[450px] max-h-[90vh] shadow-lg mx-auto">
            <div className="flex justify-between border-b border-gray-600">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                Créer un code promo
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className=" text-gray-400 hover:text-purple-700"
              >
                <X size={16} />
              </button>
            </div>

            {/* promo code form */}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
              {/* promocode title */}
              <Input
                label="Nom"
                {...register("public_name", {
                  required: "le pseudo du code promo est requis",
                })}
              />
              {errors.public_name && (
                <p className="text-red-500">
                  {String(errors.public_name.message)}
                </p>
              )}

              {/* discount type */}
              <div className="mt-2 mb-1 block font-semibold">
                <label>Type de réduction</label>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2  border border-gray-500 bg-black outline-none text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat amount (cfa)</option>
                    </select>
                  )}
                />
              </div>

              {/* discount values */}
              <Input
                label="Montant"
                type="number"
                {...register("discountValue", {
                  required: "Un montant est requis",
                })}
              />
              {errors.discountValue && (
                <p className="text-red-500">
                  {String(errors.discountValue.message)}
                </p>
              )}

              {/* code */}
              <Input
                label="Code"
                placeholder="ex: GFASH20"
                {...register("discountCode", {
                  required: "Le nom du code promo est requis",
                })}
              />
              {errors.discountCode && (
                <p className="text-red-500">
                  {String(errors.discountCode.message)}
                </p>
              )}

              <button
                type="submit"
                disabled={promoCodeMutation.isPending}
                className="w-full mt-4 p-2 flex items-center justify-center cursor-pointer font-medium gap-[2px] bg-purple-700"
              >
                {promoCodeMutation?.isPending
                  ? "Veuillez patienter..."
                  : "Créer"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
