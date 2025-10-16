"use client";
import ImagePlaceholder from "@/shared/components/image-placeholder";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../../../../../../packages/input";

const Page = () => {
  const {
    register,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];
    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }
    setImages(updatedImages);
    setValue("images", images);
  };

  // function remove an image and add blanck input if needed
  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[index] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }
      return updatedImages;
    });
    setValue("images", images);
  };

  // Handle product creattion for form submisssion
  const onSubmit = (data: any) => {
    console.log(data);
  };

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
        <span className="text-purple-500 text-base font-Poppins">
          Tableau de bord
        </span>
        <ChevronRight size={16} />
        <span className="font-Poppins text-base">Produit</span>
      </div>

      {/* content */}
      <div className="py-5 w-full flex flex-col sm:flex-row gap-6">
        {/* left side - image upload */}
        <div className="w-full sm:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceholder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              index={0}
              onChangeImage={handleImageChange}
              onRemove={handleRemoveImage}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {images.slice(1).map((_, index) => (
            <ImagePlaceholder
              key={index}
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small
              index={index + 1}
              onChangeImage={handleImageChange}
              onRemove={handleRemoveImage}
            />
          ))}
        </div>

        {/* right side - product input */}
        <div className="md:w-[65%]">
          <div className="w-full flex flex-col sm:flex-row gap-5">
            {/* product information */}
            <div className="w-full sm:w-2/4 font-Poppins">
              <Input
                label="Titre produit"
                placeholder="Enrer le titre du produit"
                {...register("titre", {
                  required: "Le titre du produit est requis",
                })}
              />
              {errors.titre && (
                <p className="text-red-500 text-sm mt-1">
                  {String(errors.titre.message)}
                </p>
              )}

              {/* description */}
              <div className="mt-2 sm:mt-3">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Description produit * "
                  placeholder="Entrer une description du produit"
                  {...register("description", {
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
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {String(errors.description.message)}
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

            <div className="w-full sm:w-2/4 font-Poppins">
              <label className="block font-semibold text-gray-300">
                category *
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;
