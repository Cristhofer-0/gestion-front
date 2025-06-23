"use client"

import React, { useState, type ReactNode } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Eye, BadgeInfo, Users, Mail, UserCircle2, Phone } from "lucide-react"
import { UsuarioData } from "../types/UsuarioData"

interface TableComponentUsersProps {
  items?: UsuarioData[]
  todos?: UsuarioData[]
  onItemClick: (user: UsuarioData) => void
  selectedItemId?: string
  renderDetails?: (user: UsuarioData) => ReactNode
}

export function TableComponentUsers({
  items = [],
  todos = [],
  onItemClick,
  selectedItemId,
  renderDetails,
}: TableComponentUsersProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = items.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.dni.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, correo o DNI..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  <UserCircle2 className="h-4 w-4" />
                  Nombre
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <BadgeInfo className="h-4 w-4" />
                  DNI
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Rol
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Teléfono
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((user) => (
                <React.Fragment key={user.userId}>
                  <TableRow
                    className={selectedItemId === user.userId ? "bg-muted/50 border-b-0" : ""}
                    onClick={() => onItemClick(user)}
                  >
                    <TableCell className="cursor-pointer font-medium">{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.dni}</TableCell>
                    <TableCell className="hidden md:table-cell capitalize">{user.role}</TableCell>
                    <TableCell className="hidden lg:table-cell">{user.phone || "-"}</TableCell>
                  </TableRow>
                  {selectedItemId === user.userId && renderDetails && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={6} className="p-0 border-t-0">
                        <div className="animate-in fade-in-0 zoom-in-95 duration-200">
                          {renderDetails(user)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
