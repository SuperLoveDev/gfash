import React from "react";

interface SizeSelectorProps {
  value?: string[];
  onChange: (sizes: string[]) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({
  value = [],
  onChange,
}) => {
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  const toggleSize = (size: string) => {
    const newSizes = value.includes(size)
      ? value.filter((s) => s !== size)
      : [...value, size];

    onChange(newSizes);
  };

  return (
    <div className="font-Poppins">
      <label className="block font-semibold text-gray-300 mb-3">
        Tailles disponibles *
      </label>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => toggleSize(size)}
            className={`px-4 py-2 border-2 rounded-lg transition-all duration-200 font-medium ${
              value.includes(size)
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-transparent border-gray-400 text-gray-300 hover:border-purple-400"
            }`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
