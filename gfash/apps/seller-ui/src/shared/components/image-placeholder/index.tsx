"use client";
import { Pencil, WandSparkles, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ImagePlaceholder = ({
  size,
  small,
  onChangeImage,
  onRemove,
  defaultImage = null,
  index = null,
  setOpenImageModal,
}: {
  size: string;
  small?: boolean;
  onChangeImage: (file: File | null, index: number) => void;
  onRemove: (index: number) => void;
  defaultImage?: string | null;
  index?: any;
  setOpenImageModal: (openImageModal: boolean) => void;
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImage);

  // Function to modify an image
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      onChangeImage(file, index!);
    }
  };

  return (
    <div
      className={`relative ${
        small ? "h-[140px] sm:h-[180px]" : "h-[230px] sm:h-[450px]"
      } cursor-pointer w-full bg-slate-900 border border-gray-600 rounded-lg flex flex-col justify-center items-center`}
    >
      <input
        type="file"
        className="hidden"
        accept="image/*"
        id={`image-upload-${index}`}
        onChange={handleFileChange}
      />

      {imagePreview ? (
        <>
          <button
            type="button"
            onClick={() => onRemove?.(index!)}
            className="absolute top-3 right-3 p-2 !rounded bg-red-600 shadow-lg cursor-pointer"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => setOpenImageModal(true)}
            className="absolute top-3 right-[70px] p-2 !rounded bg-purple-700 shadow-lg cursor-pointer"
          >
            <WandSparkles size={16} />
          </button>
        </>
      ) : (
        <label
          htmlFor={`image-upload-${index}`}
          className="absolute top-3 right-3 p-2 cursor-pointer shadow-lg bg-slate-700"
        >
          <Pencil size={16} />
        </label>
      )}

      {imagePreview ? (
        <Image
          width={400}
          height={300}
          src={imagePreview}
          alt="uploaded"
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <>
          <p
            className={`text-gray-500 ${
              small ? "text-xl" : "text-2xl"
            } font-semibold font-Poppins`}
          >
            {size}
          </p>
          <p
            className={`font-Poppins text-gray-600 ${
              small ? "text-sm" : "text-base"
            }`}
          >
            Sélectionnez une image
            <br />
            au format recommandé.
          </p>
        </>
      )}
    </div>
  );
};

export default ImagePlaceholder;
