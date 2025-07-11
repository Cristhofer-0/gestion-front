"use client"

import {
  BellIcon,
  CreditCardIcon,
  LogOutIcon,
  MoreVerticalIcon,
  UserCircleIcon,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import React, { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";

interface User {
  UserId: number;
  FullName: string;
  BirthDate: string;
  Phone: string;
  DNI: string;
  Email: string;
  Role: string;
  // otros campos...
}
export function NavUser() {
  const user = useUser();
  const { isMobile } = useSidebar();
  const router = useRouter();

  function cerrarSesion() {
    document.cookie = "loggedUser=; path=/; max-age=0";
    localStorage.removeItem("user");
    router.push("/login");
  }

  function abrirPefil() {
    router.push("/dashboard/account");
  }

  if (!user) {
    // Opcional: mientras no haya usuario puedes mostrar un spinner, un placeholder o nada
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.FullName}</span>
                {/*<span className="truncate text-xs text-muted-foreground">{user.Email}</span>*/}
                <span className="truncate text-xs text-muted-foreground"> {user.Role.charAt(0).toUpperCase() + user.Role.slice(1).toLowerCase()}</span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.FullName}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.Email}</span>
                  <span className="truncate text-xs text-muted-foreground"> {user.Role.charAt(0).toUpperCase() + user.Role.slice(1).toLowerCase()}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={abrirPefil}>
                <UserCircleIcon />
                Perfil
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={cerrarSesion} className="cursor-pointer text-red-600 hover:bg-red-100 flex items-center gap-2">
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}