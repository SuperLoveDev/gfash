"use client";

import { activeSideBarItem } from "@/configs/constant";
import { useAtom } from "jotai";

const useSiderbar = () => {
  const [activeSideBar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSideBar, setActiveSidebar };
};

export default useSiderbar;
