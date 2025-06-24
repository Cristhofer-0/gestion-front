import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { UsuarioData } from "../types/UsuarioData"
import { editarUsuario } from "@/services/usuario" // Asegúrate de tener esta función disponible

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UsuarioData
  onSubmit?: (updatedUser: UsuarioData) => void
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit }: EditUserDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | "organizer"| "helper">("user")

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role as "admin" | "user" | "organizer" | "helper")
    }
  }, [user])

  const handleSave = async () => {
    try {
      const updatedUser: UsuarioData = {
        ...user,
        role: selectedRole,
      }

      // Llamar al backend solo con los campos que vayas a actualizar
      await editarUsuario(updatedUser)

      onOpenChange(false)
      if (onSubmit) {
        onSubmit(updatedUser)
      }
    } catch (error) {
      console.error("Error al actualizar el rol del usuario:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Editar Rol de Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="organizer">Organizer</SelectItem>
              <SelectItem value="helper">Helper</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleSave}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
