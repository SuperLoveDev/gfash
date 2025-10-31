"use client";
import ImagePlaceholder from "@/shared/components/image-placeholder";
import { ChevronRight, Save } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "../../../../../../../packages/input";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/utils/axiosinstance";
import RichTextEditor from "../../../../../../../packages/RichTextEditor";
import SizeSelector from "../../../../../../../packages/size-selector";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const Page = () => {
  const {
    register,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [isChanged, setIsChanged] = useState(true);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  //get all categroies
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/produit/api/categories");
        return res.data;
      } catch (error) {
        console.error(error);
      }
    },
    staleTime: 1000 * 60 * 15,
    retry: 2,
  });

  // fetching available promo code from our promocode page
  const { data: promoCode = [], isLoading: promoLoading } = useQuery({
    queryKey: ["boutique-promo"],
    queryFn: async () => {
      const response = await axiosInstance.get("/produit/api/code-promo");
      return response?.data?.code_promo || [];
    },
  });

  const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

  const selectedCategory = watch("category");

  // categories selection
  const subCategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  // function to covert file
  const convertFileToBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    try {
      const fileName = await convertFileToBase64(file);
      const response = await axiosInstance.post(
        "/produit/api/televerser-image-produit",
        { fileName }
      );
      const updatedImages = [...images];
      updatedImages[index] = response.data.file_url;

      if (index === images.length - 1 && images.length < 8) {
        updatedImages.push(null);
      }
      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  // function remove or delete an image and add blanck input if needed
  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];
      const imageToDelete = updatedImages[index];

      if (
        imageToDelete &&
        typeof imageToDelete === "object" &&
        "fileId" in imageToDelete
      ) {
        await axiosInstance.delete("/produit/api/supprimer-image-produit", {
          data: { fileId: imageToDelete.fileId },
        });
      }

      if (typeof imageToDelete === "string") {
        await axiosInstance.delete("/produit/api/supprimer-image-produit", {
          data: { fileUrl: imageToDelete },
        });
      }
      updatedImages.splice(index, 1);

      // add an image placeholder or slot
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  // Handle product creattion for form submisssion
  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axiosInstance.post("/produit/api/creer-un-produit", data);
      router.push("/tableaudebord/tous-les-produits");
    } catch (error: any) {
      toast.error(error?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {};

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full mx-auto p-8 rounded-lg text-white"
    >
      {/* heading and breadcrum to show where the user is */}
      <h1 className="font-Poppins font-semibold text-xl sm:text-2xl">
        Creer un produit
      </h1>
      <div className="w-full flex items-center my-2">
        <Link
          href={"/tableaudebord"}
          className="text-purple-500 text-base font-Poppins"
        >
          Tableau de bord
        </Link>
        <ChevronRight size={16} />
        <span className="font-Poppins text-base">Produit</span>
      </div>

      {/* content */}
      <div className="py-5 w-full flex flex-col lg:flex-row lg:items-start gap-6">
        {/* left side - image upload */}
        <div className="w-full lg:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              size="765 x 850"
              small={false}
              index={0}
              onChangeImage={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-3">
            {images.slice(1).map((_, index) => (
              <ImagePlaceholder
                key={index}
                size="765 x 850"
                small
                index={index + 1}
                onChangeImage={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>

        {/* right side - product input */}
        <div className="md:w-[65%]">
          <div className="w-full flex flex-col sm:flex-row gap-5">
            {/* product information */}
            <div className="w-full sm:w-2/4 font-Poppins">
              <Input
                label="Titre produit"
                placeholder="Enrer le titre du produit"
                {...register("title", {
                  required: "Le titre du produit est requis",
                })}
              />
              {errors.title && (
                <p className="text-red-500 text-sm">
                  {String(errors.title.message)}
                </p>
              )}

              {/* short description */}
              <div className="mt-2 sm:mt-3">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Description produit * "
                  placeholder="Entrer une description du produit"
                  {...register("short_description", {
                    required: "Une description est requise",
                    validate: {
                      maxWords: (value: string) => {
                        const wordCount = value.trim().split(/\s+/).length;
                        return (
                          wordCount <= 150 ||
                          `La description ne doit pas dépasser 150 mots ${wordCount})`
                        );
                      },
                    },
                  })}
                />
                {errors.short_description && (
                  <p className="text-red-500 text-sm">
                    {String(errors.short_description.message)}
                  </p>
                )}
              </div>

              {/* Tags / reference  */}
              <div className="mt-2 sm:mt-3">
                <Input
                  label="Tags / Reference Produit *"
                  placeholder="Je reference mon produit tresse, boubou, tresse"
                  {...register("tag", {
                    required:
                      "Séparez les étiquettes/réference de produits associés par une virgule.",
                  })}
                />
                {errors.tag && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.tag.message)}
                  </p>
                )}
              </div>

              {/*  product waranty */}
              <div className="mt-2 sm:mt-3">
                <Input
                  label="Garantie *"
                  placeholder="1 ans de garantie / Pas de garantie"
                  {...register("warranty", {
                    required:
                      "Séparez les étiquettes/réference de produits associés par une virgule.",
                  })}
                />
                {errors.warranty && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.warranty.message)}
                  </p>
                )}
              </div>

              {/* product slugs */}
              <div className="mt-2 sm:mt-3">
                <Input
                  label="Slug (URL personnalisée) *"
                  placeholder="ex : gfash-produit-unique"
                  {...register("slug", {
                    required: "Le slug est obligatoire.",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Utilisez uniquement des lettres minuscules, chiffres et tirets (ex : montre-or-24k).",
                    },
                    minLength: {
                      value: 3,
                      message: "Le slug doit contenir au moins 3 caractères.",
                    },
                  })}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.slug.message)}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="mt-2 sm:mt-3">
                <Input
                  label="Marque *"
                  placeholder="GFASH"
                  {...register("brand", {
                    required: "Donner un nom a votre commerce",
                  })}
                />
                {errors.brand && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.brand.message)}
                  </p>
                )}
              </div>
            </div>

            {/* category and subcategory section */}
            <div className="w-full sm:w-2/4 font-Poppins">
              <label className="block font-semibold text-gray-300">
                Catégorie *
              </label>

              {isLoading ? (
                <p className="text-gray-400">Chargement des catégories...</p>
              ) : isError ? (
                <p className="text-red-500">Erreur lors du chargement</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "La catégorie est obligatoire" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full p-2 border-2 outline-none border-gray-400 bg-transparent"
                    >
                      <option value="" className="bg-black">
                        Sélectionnez une catégorie
                      </option>
                      {categories?.map((category: string) => (
                        <option value={category} key={category} className="bg-">
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500">
                  {String(errors.category.message)}
                </p>
              )}

              <div className="mt-2 font-Poppins">
                <label className="block font-semibold text-gray-300">
                  Sous-catégorie *
                </label>

                {isLoading ? (
                  <p className="text-gray-400">
                    Chargement des sous-catégories...
                  </p>
                ) : isError ? (
                  <p className="text-red-500">Erreur lors du chargement</p>
                ) : (
                  <Controller
                    name="subCategory"
                    control={control}
                    rules={{ required: "La sous-catégorie est obligatoire" }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 border-2 outline-none border-gray-400 bg-transparent"
                      >
                        <option value="" className="bg-black">
                          Sélectionnez une sous-catégorie
                        </option>
                        {subCategories?.map((subCategory: string) => (
                          <option value={subCategory} key={subCategory}>
                            {subCategory}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                )}
                {errors.subCategory && (
                  <p className="text-red-500">
                    {String(errors.subCategory.message)}
                  </p>
                )}
              </div>

              {/* detailed description Rich text with react-quill-new */}
              <div className="mt-3 font-Poppins">
                <label>Description détaillée *(Min 100 mots)</label>
                <Controller
                  name="detailed_description"
                  control={control}
                  rules={{
                    required: "détail du produit est requis",
                    validate: (value) => {
                      const wordCount = value
                        .split(/\s+/)
                        .filter((word: string) => word).length;
                      return (
                        wordCount >= 100 ||
                        "La description doit contenir au moins 100 mots"
                      );
                    },
                  }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.detailed_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.detailed_description.message)}
                  </p>
                )}
              </div>

              {/* video input */}
              <div className="mt-2 font-Poppins">
                <Input
                  label="Video URL *"
                  placeholder="https://www.youtube.com/embed/xyz123"
                  {...register("video_url", {
                    pattern: {
                      value:
                        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
                      message: "Veuillez entrer une URL d'une video valide",
                    },
                  })}
                />
                {errors.video_url && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.video_url.message)}
                  </p>
                )}
              </div>

              {/* regular price input */}
              <div className="mt-2 font-Poppins">
                <Input
                  label="Prix Normal *"
                  placeholder="10.000 FCFA"
                  {...register("regular_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Le prix doit être d'au moins 1 FCFA",
                    },
                    validate: (value) =>
                      !isNaN(value) || "Seuls les chiffres sont autorisés",
                  })}
                />
                {errors.regular_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.regular_price.message)}
                  </p>
                )}
              </div>

              {/* sale price or promo */}
              <div className="mt-2 font-Poppins">
                <Input
                  label="Prix promotionnel *"
                  placeholder="9.000 FCFA"
                  {...register("sale_price", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Le prix doit être d'au moins 1 FCFA",
                    },
                    validate: (value) => {
                      if (isNaN(value))
                        return "Seuls les chiffres sont autorisés";

                      const regularPrice = watch("regular_price");
                      if (regularPrice && value >= regularPrice) {
                        return "Le prix promotionnel doit être inférieur au prix normal";
                      }

                      return true;
                    },
                  })}
                />
                {errors.sale_price && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.sale_price.message)}
                  </p>
                )}
              </div>

              {/* stock */}
              <div className="mt-2 font-Poppins">
                <Input
                  label="Stock *"
                  placeholder="100"
                  {...register("stock", {
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Le stock doit être d'au moins 1",
                    },
                    validate: (value) => {
                      if (isNaN(value))
                        return "Seuls les chiffres sont autorisés";

                      if (!Number.isInteger(value))
                        return "Le nombre de stock doit etre en chiffre!";
                      return true;
                    },
                  })}
                />
                {errors.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.stock.message)}
                  </p>
                )}
              </div>

              {/* size selecting */}
              <div className="mt-2 font-Poppins">
                <Controller
                  name="sizes"
                  control={control}
                  rules={{ required: "Sélectionnez au moins une taille" }}
                  render={({ field }) => (
                    <SizeSelector
                      value={field.value || []}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.sizes && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.sizes.message)}
                  </p>
                )}
              </div>

              {/* Discount code */}
              <div className="mt-3 font-Poppins">
                <label className="block font-semibold text-gray-200">
                  Sélectionnez un code promo (optionnel)
                </label>

                {promoLoading ? (
                  <p className="text-gray-300">Chargement des codes promo...</p>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {promoCode?.map((code: any) => {
                      const selectedCodes = watch("promoCodes") || [];
                      const isSelected = selectedCodes.includes(code.id);

                      return (
                        <button
                          key={code.id}
                          type="button"
                          className={`px-3 py-1 rounded-md text-sm font-semibold border transition ${
                            isSelected
                              ? "bg-purple-600 border-purple-500 text-white"
                              : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                          }`}
                          onClick={() => {
                            const updatedSelection = isSelected
                              ? selectedCodes.filter(
                                  (id: string) => id !== code.id
                                )
                              : [...selectedCodes, code.id];

                            setValue("promoCodes", updatedSelection);
                          }}
                        >
                          {code.public_name} ({code.discountValue}
                          {code.discountType === "percentage" ? "%" : " FCFA"})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2 sm:gap-3">
        {isChanged && (
          <button
            type="submit"
            onClick={handleSaveDraft}
            className="p-1 px-2 bg-slate-600 text-gray-400 rounded-md flex items-center gap-1 font-medium"
          >
            <Save size={16} />
            <span className="">Brouillon</span>
          </button>
        )}

        <button
          type="submit"
          className="bg-purple-700 text-white p-1 px-2 rounded-md font-medium"
          disabled={loading}
        >
          {loading ? "Creation en cours..." : "Créer"}
        </button>
      </div>
    </form>
  );
};

export default Page;
