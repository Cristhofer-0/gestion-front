"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { ShieldIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useUser } from "@/hooks/useUser"
import { editarUsuario } from "@/services/usuario"
import { cambiarPassword } from "@/services/usuario"

export function AccountProfile() {
  const user = useUser()


  // Estados iniciales vacíos
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Estados para el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Cuando `user` esté disponible, carga los valores en los inputs
  useEffect(() => {
    if (user) {
      setFullName(user.FullName || "")
      setEmail(user.Email || "")
      setPhone(user.Phone || "")
    }
  }, [user])

  const [mensajeExito, setMensajeExito] = useState("")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!user?.UserId) {
        toast.error("No se encontró el ID del usuario.")
        return
      }

      await editarUsuario({
        userId: String(user.UserId),
        fullName,
        email,
        phone,
      })

      toast.success("Perfil actualizado correctamente")
      setMensajeExito("Perfil actualizado correctamente")
      setTimeout(() => setMensajeExito(""), 3000)
    } catch (err) {
      toast.error("No se pudo actualizar el perfil")
      console.error(err)
    }
  }

  const handlePasswordChange = async () => {
    if (!user?.UserId) {
      toast.error("Usuario no válido")
      return
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Por favor, completa todos los campos")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Las nuevas contraseñas no coinciden")
      return
    }

    try {
      await cambiarPassword({
        userId: String(user.UserId),
        currentPassword,
        newPassword,
      })

      toast.success("Contraseña actualizada correctamente")
      // Limpia campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar la contraseña")
      console.error(error)
    }
  }


  return (
    <div className="px-4 lg:px-6">
      <Tabs defaultValue="profile" className="w-full">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Ajustes de perfil</h1>
            <p className="text-muted-foreground">Maneja tus datos</p>
          </div>
          <TabsList className="grid w-full grid-cols-2 md:w-auto">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del perfil</CardTitle>
              <CardDescription>Actualiza tu información</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-medium">{user?.FullName}</h3>
                  <p className="text-sm text-muted-foreground">{user?.Role}</p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="DNI">Documento de Identificación</Label>
                    <Input id="DNI" value={user?.DNI || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>

                <CardFooter className="flex justify-end gap-2 p-0 pt-4">
                  <Button variant="outline" type="button"
                    onClick={() => {
                      setFullName(user?.FullName || "")
                      setEmail(user?.Email || "")
                      setPhone(user?.Phone || "")
                      toast.info("Se restauraron los datos originales.")
                    }}>Cancelar</Button>
                  <Button type="submit">Guardar cambios</Button>
                </CardFooter>
              </form>
              {mensajeExito && (
                <div className="rounded-md bg-green-100 px-4 py-2 text-sm text-green-800 border border-green-300">
                  {mensajeExito}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contraseña</CardTitle>
              <CardDescription>Cambia tu contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setCurrentPassword("")
                  setNewPassword("")
                  setConfirmPassword("")
                  toast.info("Campos reiniciados")
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handlePasswordChange}>
                Guardar nueva contraseña
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
