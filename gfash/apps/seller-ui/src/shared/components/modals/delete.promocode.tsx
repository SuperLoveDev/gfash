"use client";
import { X } from "lucide-react";
import React from "react";

const DeletePromoCodeModal = ({
  promo,
  onClose,
  onConfirm,
}: {
  promo: any;
  onClose: () => void;
  onConfirm: any;
}) => {
  return (
    <div className="top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-slate-700 p-4 sm:p-6 rounded-lg w-[320px] sm:w-[450px] max-h-[90vh] shadow-lg mx-auto">
        {/* Header */}
        <div className="flex justify-between border-b border-gray-600">
          <h3 className="text-lg sm:text-xl font-semibold text-white">
            Supprimer le code promo
          </h3>
          <button
            className="text-gray-400 hover:text-purple-700"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        {/* message deletion */}
        <p className="text-gray-300 my-3">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="text-purple-500">{promo.public_name}</span> ? <br />{" "}
          Cette action est irréversible.
        </p>

        {/* action button */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="bg-purple-700 p-1 px-3 rounded-xl"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-700 p-1 px-3 rounded-xl"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePromoCodeModal;
