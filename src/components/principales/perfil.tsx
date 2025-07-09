"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PencilIcon, ShieldIcon, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { useUser } from "@/hooks/useUser"
import { editarUsuarioPerfil } from "@/services/usuario"
import { cambiarPassword } from "@/services/usuario"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function AccountProfile() {
  const user = useUser()
  const router = useRouter()

  // Estados iniciales vacíos
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Estados para el cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isEditing, setIsEditing] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [showPasswordEditDialog, setShowPasswordEditDialog] = useState(false)
  const [showPasswordSuccessDialog, setShowPasswordSuccessDialog] = useState(false)

  // Cuando `user` esté disponible, carga los valores en los inputs
  useEffect(() => {
    if (user) {
      setFullName(user.FullName || "")
      setEmail(user.Email || "")
      setPhone(user.Phone || "")
    }
  }, [user])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!user?.UserId) {
        toast.error("No se encontró el ID del usuario.")
        return
      }

      await editarUsuarioPerfil({
        userId: String(user.UserId),
        fullName,
        email,
        phone,
      })

      toast.success("Perfil actualizado correctamente")
      setShowSuccessDialog(true) // Mostrar popup de éxito
      setIsEditing(false) // Desactivar modo edición
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
      setShowPasswordSuccessDialog(true) // Mostrar popup de éxito
      setIsEditingPassword(false) // Desactivar modo edición
      // Limpia campos
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast.error(error.message || "Error al cambiar la contraseña")
      console.error(error)
    }
  }

  function cerrarSesion() {
    document.cookie = "loggedUser=; path=/; max-age=0";
    localStorage.removeItem("user");
    router.push("/login");
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
                  <p className="text-sm text-muted-foreground">  {user?.Role ? user.Role.charAt(0).toUpperCase() + user.Role.slice(1).toLowerCase() : ""}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowEditDialog(true)}>
                      <PencilIcon className="h-3.5 w-3.5" />
                      {isEditing ? "Editando..." : "Change"}
                    </Button>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="DNI">Documento de Identificación</Label>
                    <Input id="DNI" value={user?.DNI || ""} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} />
                  </div>
                </div>

                <CardFooter className="flex justify-end gap-2 p-0 pt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setFullName(user?.FullName || "")
                      setEmail(user?.Email || "")
                      setPhone(user?.Phone || "")
                      setIsEditing(false)
                      toast.info("Se restauraron los datos originales y se desactivó el modo edición.")
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={!isEditing}>
                    Guardar cambios
                  </Button>
                </CardFooter>
              </form>
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
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-medium">Configuración de seguridad</h3>
                  <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
                </div>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setShowPasswordEditDialog(true)}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  {isEditingPassword ? "Editando..." : "Change"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Contraseña actual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={!isEditingPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!isEditingPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!isEditingPassword}
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
                  setIsEditingPassword(false)
                  toast.info("Campos reiniciados y modo edición desactivado")
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={handlePasswordChange} disabled={!isEditingPassword}>
                Guardar nueva contraseña
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              ¡Perfil actualizado!
            </DialogTitle>
            <DialogDescription className="text-left">
              Tu información de perfil ha sido actualizada correctamente, tendra que cerrar sesion para que los cambios se apliquen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                cerrarSesion()
                setShowSuccessDialog(false)
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Cerrar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilIcon className="h-5 w-5 text-orange-500" />
              Activar modo de edición
            </DialogTitle>
            <DialogDescription className="text-left">
              Estás a punto de activar el modo de edición para tu perfil. Podrás modificar tu información personal como
              nombre, email y teléfono.
              <br />
              <br />
              <strong>Recuerda:</strong> Los cambios deberán ser guardados para ser aplicados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsEditing(true)
                setShowEditDialog(false)
                toast.info("Modo de edición activado")
              }}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Activar edición
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Popup de confirmación para editar contraseña */}
      <Dialog open={showPasswordEditDialog} onOpenChange={setShowPasswordEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldIcon className="h-5 w-5 text-red-500" />
              Cambiar contraseña
            </DialogTitle>
            <DialogDescription className="text-left">
              Estás a punto de modificar tu contraseña de acceso. Esta es una acción de seguridad importante.
              <br />
              <br />
              <strong>Importante:</strong> Asegúrate de recordar tu nueva contraseña y guárdala en un lugar seguro.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between w-full">
            <Button variant="outline" onClick={() => setShowPasswordEditDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setIsEditingPassword(true)
                setShowPasswordEditDialog(false)
                toast.info("Modo de edición de contraseña activado")
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Activar edición
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Popup de éxito para contraseña cambiada */}
      <Dialog open={showPasswordSuccessDialog} onOpenChange={setShowPasswordSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <ShieldIcon className="h-5 w-5 text-green-600" />
              </div>
              ¡Contraseña actualizada!
            </DialogTitle>
            <DialogDescription className="text-left">
              Tu contraseña ha sido cambiada exitosamente. Tu cuenta ahora está protegida con la nueva contraseña.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowPasswordSuccessDialog(false)} className="bg-green-600 hover:bg-green-700">
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
