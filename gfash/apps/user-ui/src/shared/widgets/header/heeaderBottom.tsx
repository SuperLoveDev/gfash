"use client";
import { navItem } from "@/configs/constants";
import useUser from "@/hooks/useUser";

import {
  AlignLeft,
  ChevronDown,
  HeartCrack,
  ShoppingCart,
  User,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const HaederBottom = () => {
  const [show, setShow] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoading } = useUser();

  console.log(user);

  // track the scroll bar
  useEffect(() => {
    const handleScrollBar = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener("scroll", handleScrollBar);
    return () => window.removeEventListener("scroll", handleScrollBar);
  }, []);

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isSticky ? "fixed top-0 left-0 z-[100] bg-white" : "relative"
      }`}
    >
      <div
        className={`w-full sm:w-[90%] relative m-auto flex items-center sm:justify-between ${
          isSticky ? "pt-3" : "py-0"
        }`}
      >
        {/* All dropdown */}
        <div
          className={`w-[180px] sm:w-[240px] ${
            isSticky && "-mb-2"
          } cursor-pointer flex items-center justify-between sm:px-5 h-[50px] bg-purple-600`}
          onClick={() => setShow(!show)}
        >
          <div className="flex items-center gap-2">
            <AlignLeft color="white" />
            <span className="text-xs text-white font-medium sm:text-sm">
              Tous
            </span>
          </div>
          <ChevronDown color="white" />
        </div>

        {/* doprdown menu */}
        {show && (
          <div
            className={`absolute text-gray-800 px-3 left-0 top-[50px] sm:top-[50px] w-full sm:w-[240px] h-[400px] sm:h-[400px] bg-gray-200 z-50`}
          ></div>
        )}

        {/* navigation links */}
        <div className="flex items-center">
          {navItem.map((i: NavItemsType, index: number) => (
            <Link
              className="px-3 text-sm sm:text-base md:text-lg text-gray-500"
              href={i.href}
              key={index}
            >
              {i.title}
            </Link>
          ))}
        </div>

        <div>
          {isSticky && (
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                {!isLoading && user ? (
                  <>
                    <Link
                      href={"/profile"}
                      className="w-[50px] h-[50px] border-[2px] border-gray-400 rounded-full flex items-center justify-center"
                    >
                      <User color="white" />
                    </Link>
                    <Link href={"/connexion"} className="">
                      <span className="block font-medium text-gray-300">
                        Bienvenue,
                      </span>
                      <span className="block font-bold text-gray-300">
                        {user?.name}
                      </span>
                    </Link>
                  </>
                ) : (
                  <Link href={"/connexion"} className="">
                    <span className="block font-medium text-gray-300">
                      Bienvenue,
                    </span>
                    <span className="block font-bold text-gray-300">
                      {isLoading ? "..." : "connexion"}
                    </span>
                  </Link>
                )}
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
                    <span className="text-white font-medium text-sm">0</span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HaederBottom;
