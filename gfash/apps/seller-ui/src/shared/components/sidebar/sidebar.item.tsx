import Link from "next/link";
import React from "react";

interface Props {
  title: string;
  icons: React.ReactNode;
  isActive?: boolean;
  href: string;
}

const SidebarItems = ({ title, icons, isActive, href }: Props) => {
  return (
    <Link href={href} className="my-1 block">
      <div
        className={`flex gap-4 w-30 sm:w-full min-h-12 h-full items-center px-[10px] rounded-lg cursor-pointer transition hover:bg-gray-800 ${
          isActive && "scale-[.98] bg-gray-800 fill-blue-200 hover:bg-gray-600"
        }`}
      >
        <span className="hidden sm:block">{icons}</span>
        <h5 className="text-slate-200 text-sm sm:text-lg font-medium hover:text-purple-600">
          {title}
        </h5>
      </div>
    </Link>
  );
};

export default SidebarItems;
