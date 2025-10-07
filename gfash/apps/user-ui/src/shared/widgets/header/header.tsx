import { HeartCrack, Search, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import React from "react";
import HaederBottom from "./heeaderBottom";

const Header = () => {
  return (
    <>
      <div className="w-full bg-purple-950">
        <div className="flex flex-wrap items-center justify-between gap-4 px-[4vw] sm:px-[5vw] md:px-[7vw] lg:px-[9vw] py-4">
          <div className="">
            <Link href={"/"}>
              <span className="text-white text-3xl font-bold">GFASH.</span>
            </Link>
          </div>

          <div className="w-full relative sm:w-[60%] md:w-[50%] order-last sm:order-none">
            <input
              type="text"
              placeholder="Rechercher gfash produit..."
              className="h-[45px] w-full px-2 border font-medium outline-none"
            />
            <div className="h-[45px] border bg-purple-400 cursor-pointer px-5 flex items-center justify-center absolute top-0 right-0">
              <Search color="white" />
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Link
                href={"/connexion"}
                className="w-[50px] h-[50px] border-[2px] border-gray-400 rounded-full flex items-center justify-center"
              >
                <User color="white" />
              </Link>

              <Link href={"/connexion"} className="">
                <span className="block font-medium text-gray-300">
                  Bienvenue,
                </span>
                <span className="block font-bold text-gray-300">LogIn</span>
              </Link>
            </div>

            <div className="flex items-center gap-5">
              <Link href={"/whislit"} className="relative">
                <HeartCrack size={30} color="gray" />
                <div className="absolute top-[-10px] right-[-10px] border rounded-full w-6 h-6 bg-red-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">0</span>
                </div>
              </Link>

              <Link href={"/cart"} className="relative">
                <ShoppingCart size={30} color="gray" />
                <div className="absolute top-[-10px] right-[-10px] border rounded-full w-6 h-6 bg-red-500 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">10</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <HaederBottom />
    </>
  );
};

export default Header;
