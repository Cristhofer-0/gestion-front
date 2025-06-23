"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchUsuarios } from "@/services/usuario"
import { UsuarioData } from "./types/UsuarioData"
import { ReloadIcon } from "../custom/iconos"
import { TableComponentUsers } from "./form/table-component-users" // Puedes ajustar o crear uno nuevo para usuarios

export function UserTable() {
  const [usuarios, setUsuarios] = useState<UsuarioData[]>([])
  const [selectedUser, setSelectedUser] = useState<UsuarioData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = usuarios.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(usuarios.length / itemsPerPage)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchUsuarios()
      setUsuarios(data)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error al obtener usuarios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserClick = (user: UsuarioData) => {
    if (selectedUser?.userId === user.userId) {
      setSelectedUser(null)
    } else {
      setSelectedUser(user)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Visualiza y administra los usuarios registrados</CardDescription>
          <div className="flex gap-2">
            <Button onClick={fetchData} disabled={isLoading}>
              {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
              Cargar Usuarios
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <TableComponentUsers
            items={currentItems}
            todos={usuarios}
            onItemClick={handleUserClick}
            selectedItemId={selectedUser?.userId}
            renderDetails={(user) => (
              <div className="p-4 bg-muted/30 rounded-lg">
                <p><strong>Nombre:</strong> {user.fullName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>DNI:</strong> {user.dni}</p>
                <p><strong>Teléfono:</strong> {user.phone}</p>
                <p><strong>Rol:</strong> {user.role}</p>
              </div>
            )}
          />

          {usuarios.length > 0 && (
            <div className="flex justify-center mt-6 gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                {"<<"}
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={pageNumber === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                {">>"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
