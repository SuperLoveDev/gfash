import React from "react";

interface Props {
  title: string;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="block">
      <h3 className="text-xs font-bold sm:text-xs text-purple-600 tracking-[0.04rem] pl-1">
        {title}
      </h3>
      {children}
      <hr className="text-gray-400 mb-3" />
    </div>
  );
};

export default SidebarMenu;
