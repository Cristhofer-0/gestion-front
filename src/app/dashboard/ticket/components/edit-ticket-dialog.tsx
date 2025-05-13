import { useState, useEffect } from "react"
import type { ItemData } from "./data-table"
import type { EditTicketFormData } from "../utils/types" // si lo extraes
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarTicket } from "../utils/tickets" // Asegúrate de que esta función esté definida

interface EditTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket: ItemData
  onSubmit: (data: EditTicketFormData) => void
}


export function EditTicketDialog({ open, onOpenChange, ticket, onSubmit }: EditTicketDialogProps) {
  const [categoryInput, setCategoryInput] = useState("") 
  const [formData, setFormData] = useState<EditTicketFormData>({
    eventoId: ticket.eventoId,
    tipo: "General",
    precio: 0,
    descripcion: "",
    stockDisponible: 0, 
  })

  // Actualiza formData cuando el ticket cambie
  useEffect(() => {
    if (ticket) {
      setFormData({
        eventoId:  ticket.eventoId,
        tipo: ticket.tipo || "General",
        precio: ticket.precio || 0,
        descripcion: ticket.descripcion || "",
        stockDisponible: ticket.stockDisponible || 0,
      })
    }
  }, [ticket]) // Solo se ejecutará cuando `ticket` cambie

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" || name === "stockDisponible" ? parseFloat(value) : value,
    }))

  }


  const handleSelectChange = (value: "General" | "VIP") => {
    setFormData((prev) => ({ ...prev, tipo: value }))
  }
  
  const handleStatusChange = (value: "draft" | "published") => {
  };

  const handleAddCategory = () => {

  }

  const handleRemoveCategory = (category: string) => {
  }

  const handleSubmit = async () => {
  if (!ticket.id) {
    console.error("ID del ticket no definido");
    return;
  }

  try {
    // Asegúrate de que `formData.ubicacion` nunca sea `undefined`
    await editarTicket(ticket.id, {
        eventoId: formData.eventoId,
        tipo: formData.tipo,
        precio: formData.precio,
        titulo: ticket.titulo,
        descripcion: formData.descripcion,
        stockDisponible: formData.stockDisponible,
    });

    onOpenChange(false);
  } catch (error) {
    console.error("Error al editar el evento:", error);
  }
};

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
          <Input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" />
          <Input name="precio" value={formData.precio} onChange={handleChange} placeholder="Precio" />
          <Input name="stockDisponible" value={formData.stockDisponible} onChange={handleChange} placeholder="Stock disponible" /> 
          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
