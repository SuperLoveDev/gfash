"use client";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Search,
  Pencil,
  Trash,
  Plus,
  BarChart,
  Star,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/utils/axiosinstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import DeleteConfirmationModal from "@/shared/components/modals/delete.confirmation.modal";

const fetchProducts = async () => {
  const response = await axiosInstance.get(
    "/produit/api/recuperer-produits-boutique"
  );
  return response?.data?.products;
};

const deleteProduct = async (productId: string) => {
  await axiosInstance.delete(`/produit/api/supprimer-produit/${productId}`);
};

const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["boutique-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  //delete product Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutique-products"] });
      setShowDeleteModal(false);
    },
  });

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "images",
        header: "Image",
        cell: ({ row }: any) => {
          console.log(row.original);
          return (
            <Image
              src={row.original.images[0]?.url}
              alt={row.original.title}
              width={200}
              height={200}
              className="w-12 h-12 rounded-md object-cover"
            />
          );
        },
      },
      {
        accessorKey: "title",
        header: "Nom Produit",
        cell: ({ row }: any) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
              title={row.original.title}
              className="text-purple-600 hover:underline font-medium"
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: "price",
        header: "Prix",
        cell: ({ row }: any) => (
          <span className="font-semibold">
            {row.original.sale_price || row.original.regular_price} FCFA
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }: any) => (
          <span
            className={`font-medium ${
              row.original.stock < 10
                ? "text-red-500"
                : row.original.stock < 20
                ? "text-yellow-500"
                : "text-green-500"
            }`}
          >
            {row.original.stock} unités
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Catégorie",
        cell: ({ row }: any) => (
          <span className="capitalize bg-gray-700 px-2 py-1 rounded text-sm">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "ratings",
        header: "Note",
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={16} fill="currentColor" />
            <span className="text-white font-medium">
              {row.original.ratings || "5.0"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "actions",
        header: "Opérations",
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <Link
              href={`/tableaudebord/produit/modifier/${row.original.id}`}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              title="Modifier"
            >
              <Pencil size={16} />
            </Link>
            <button
              className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              title="Analytiques"
            >
              <BarChart size={16} />
            </button>
            <button
              className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={() => openDeleteModal(row.original)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: "includesString",
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8 text-white">
      {/* header */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-bold">Tous mes produits</h2>
        <Link
          href={"/tableaudebord/creer-produit"}
          className="flex items-center bg-purple-600 text-gray-300 p-3 px-4 rounded-lg hover:bg-purple-700 transition"
        >
          <Plus size={18} className="mr-2" />
          <span className="hidden sm:block">Ajouter un produit</span>
        </Link>
      </div>

      {/* breadcrumb */}
      <div className="flex justify-between items-center">
        <div className="w-full flex items-center my-2">
          <Link
            href={"/tableaudebord"}
            className="text-purple-500 text-base font-Poppins hover:underline"
          >
            Tableau de bord
          </Link>
          <ChevronRight size={16} />
          <span className="font-Poppins text-base">Produits</span>
        </div>
      </div>

      {/* search bar */}
      <div className="mb-6 flex items-center bg-gray-800 p-3 rounded-lg flex-1 border border-gray-700">
        <Search size={18} className="mr-3 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          className="w-full bg-transparent text-gray-200 outline-none placeholder-gray-400"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Chargement des produits en cours...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-750 border-b border-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="p-4 text-left text-sm font-semibold text-gray-300"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-700 hover:bg-gray-750 transition"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && table.getRowModel().rows.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">Aucun produit trouvé</p>
            <Link
              href={"/tableaudebord/creer-produit"}
              className="inline-block mt-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Créer votre premier produit
            </Link>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
        />
      )}
    </div>
  );
};

export default ProductList;
