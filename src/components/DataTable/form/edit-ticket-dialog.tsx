import { useState, useEffect } from "react"
import type { ItemData } from "../data-table-tickets"
import type { EditTicketFormData } from "../../tickets/types" // si lo extraes
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarTicket } from "../../../services/tickets" // Asegúrate de que esta función esté definida

interface EditTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: ItemData
  onSubmit: (data: EditTicketFormData) => void
}

export const adaptEditFormDataToItemData = (
  data: EditTicketFormData & { id: string; titulo: string }
): ItemData => ({
  id: data.id,
  eventoId: data.eventoId,
  tipo: data.tipo,
  precio: Number(data.precio),
  titulo: data.titulo,
  descripcion: data.descripcion,
  stockDisponible: Number(data.stockDisponible),
})


export function EditTicketDialog({ open, onOpenChange, ticket, onSubmit }: EditTicketDialogProps) {
  const [categoryInput, setCategoryInput] = useState("")
  const [formData, setFormData] = useState<EditTicketFormData>({
    eventoId: ticket.eventoId,
    tipo: "General",
    precio: 0,
    descripcion: "",
    stockDisponible: 0,
  })
    
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Actualiza formData cuando el ticket cambie
  useEffect(() => {
    if (ticket) {
      setFormData({
        eventoId: ticket.eventoId,
        tipo: ticket.tipo || "General",
        precio: ticket.precio || 0,
        descripcion: ticket.descripcion || "",
        stockDisponible: ticket.stockDisponible || 0,
      })
      setErrors({})
    }
  }, [ticket]) // Solo se ejecutará cuando `ticket` cambie

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "stockDisponible" ? parseFloat(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }


  const handleSelectChange = (value: "General" | "VIP") => {
    setFormData((prev) => ({ ...prev, tipo: value }))
  }

  const validate = () => {
    const newErrors: typeof errors = {}


    if (isNaN(formData.precio) || formData.precio <= 0) {
      newErrors.precio = "El precio debe ser un número positivo."
    }

    if (formData.descripcion.length > 200) {
      newErrors.descripcion = "La descripción no puede exceder 200 caracteres."
    }

    if (isNaN(formData.stockDisponible) || formData.stockDisponible < 0) {
    newErrors.stockDisponible = "El stock debe ser un número entero igual o mayor a cero."
  }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }


  const handleStatusChange = (value: "draft" | "published") => {
  };

  const handleAddCategory = () => {

  }

  const handleRemoveCategory = (category: string) => {
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!ticket.id) {
    console.error("ID del ticket no definido")
    return
  }
  if (!validate()) return
  try {
    const updatedData = {
      eventoId: formData.eventoId,
      tipo: formData.tipo,
      precio: formData.precio,
      descripcion: formData.descripcion,
      stockDisponible: formData.stockDisponible,
      titulo: ticket.titulo, // Añade el título requerido
    }

    await editarTicket(ticket.id, updatedData)

    onSubmit(updatedData) // 👉 Llama al callback para notificar al padre

    onOpenChange(false)
  } catch (error) {
    console.error("Error al editar el ticket:", error)
  }
}


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={formData.tipo} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
          <Input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" 
          />
          {errors.descripcion && <p className="text-red-600 text-sm">{errors.descripcion}</p>}
          <Input 
            name="precio"
            type="number"
            min="0"
            step="0.01"
            value={formData.precio}
            onChange={handleChange}
            placeholder="Precio" 
          />
          {errors.precio && <p className="text-red-600 text-sm">{errors.precio}</p>}
          <Input 
            name="stockDisponible" 
            type="number"
            min="0"
            step="1"
            value={formData.stockDisponible} 
            onChange={handleChange} 
            placeholder="Stock disponible" 
          />
          {errors.stockDisponible && (
            <p className="text-red-600 text-sm">{errors.stockDisponible}</p>
          )}
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
