"use client";
import useSeller from "@/hooks/useSeller";
import useSidebar from "@/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { SideBar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "@/assets/svgs/logo";
import SidebarItems from "./sidebar.item";
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  HandCoins,
  Home,
  ListOrdered,
  LogOut,
  Mail,
  PackageIcon,
  Settings,
  SquarePlus,
  TicketPercent,
} from "lucide-react";
import SidebarMenu from "./sidebar.menu";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  console.log(seller);

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  // const getIconColor = (route: string) => {
  //   activeSidebar ? "purple" : "black";
  // };

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflow: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <SideBar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box className="text-xl font-medium text-purple-700">
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedecf]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </SideBar.Header>

      <div className="block my-3 h-full">
        <SideBar.Body className="body sidebar">
          <SidebarItems
            href="/tableaudebord"
            title="Tableau de Bord"
            icons={
              <Home
                className={
                  activeSidebar === "/tableaudebord"
                    ? "text-purple-500"
                    : "text-white"
                }
              />
            }
            isActive={activeSidebar === "/tableaudebord"}
          />

          {/* MAIN MENU */}
          <div className="mt-2 block">
            <SidebarMenu title="MENU PRINCIPAL">
              <SidebarItems
                href="/tableaudebord/commandes"
                title="List Commandes"
                icons={
                  <ListOrdered
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/commandes"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/commandes"}
              />

              <SidebarItems
                href="/tableaudebord/paiement"
                title="Mes Paiements"
                icons={
                  <HandCoins
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/paiement"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/paiement"}
              />
            </SidebarMenu>

            {/* PRODUCTS */}
            <SidebarMenu title="PRODUITS">
              <SidebarItems
                href="/tableaudebord/creer-produit"
                title="Creer un Produit"
                icons={
                  <SquarePlus
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/creer-produit"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/creer-produit"}
              />

              <SidebarItems
                href="/tableaudebord/tous-les-produits"
                title="Tous mes Produits"
                icons={
                  <PackageIcon
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/tous-les-produits"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/tous-les-produits"}
              />
            </SidebarMenu>

            {/* EVENT */}
            <SidebarMenu title="EVENEMENTS">
              <SidebarItems
                href="/tableaudebord/creer-evenement"
                title="Creer Evenements"
                icons={
                  <CalendarPlus
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/creer-evenement"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/creer-evenement"}
              />

              <SidebarItems
                href="/tableaudebord/tous-mes-evenement"
                title="Mes Evenements"
                icons={
                  <BellPlus
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/tous-mes-evenement"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/tous-mes-evenement"}
              />
            </SidebarMenu>

            {/* CONTROLLERS / MANAGEMENT */}
            <SidebarMenu title="GESTION">
              <SidebarItems
                href="/tableaudebord/boite-reception"
                title="Boite de Réception"
                icons={
                  <Mail
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/boite-reception"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/boite-reception"}
              />

              <SidebarItems
                href="/tableaudebord/parametre"
                title="Parametre"
                icons={
                  <Settings
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/parametre"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/parametre"}
              />

              <SidebarItems
                href="/tableaudebord/notification"
                title="Notification"
                icons={
                  <BellRing
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/notification"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/notification"}
              />
            </SidebarMenu>

            {/* EXTRAS */}
            <SidebarMenu title="EXTRAS">
              <SidebarItems
                href="/tableaudebord/code-promo"
                title="Code Promo"
                icons={
                  <TicketPercent
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/code-promo"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/code-promo"}
              />

              <SidebarItems
                href="/tableaudebord/deconnexion"
                title="Deconnexion"
                icons={
                  <LogOut
                    size={26}
                    className={
                      activeSidebar === "/tableaudebord/deconnexion"
                        ? "text-purple-500"
                        : "text-white"
                    }
                  />
                }
                isActive={activeSidebar === "/tableaudebord/deconnexion"}
              />
            </SidebarMenu>
          </div>
        </SideBar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
