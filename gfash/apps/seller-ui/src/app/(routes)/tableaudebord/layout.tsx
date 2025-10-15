import SidebarWrapper from "@/shared/components/sidebar/sidebar";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full min-h-screen bg-black text-white">
      {/* sidebar */}
      <aside className="w-[140px] sm:w-[270px] border-r border-r-white">
        <div className="sticky top-0 text-xs sm:text-base p-2 sm:p-4">
          <SidebarWrapper />
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1">
        <div className="overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
