"use client";

import { activeSideBarItem } from "@/configs/constant";
import { useAtom } from "jotai";

const useSidebar = () => {
  const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem);
  return { activeSidebar, setActiveSidebar };
};

export default useSidebar;
