import { useState, useEffect, useRef } from "react"
import type { ItemData } from "../types/ItemData"

import type { EditEventFormData } from "./types/EventFormData"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarEvento } from "../../../services/eventos" // Asegúrate de que esta función esté definida

import MapLibreMap from "@/components/principales/mapa"
import { Label } from "recharts"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

interface EditEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: ItemData
  onSubmit: (data: EditEventFormData) => void
}

// Function UploadImage
import { uploadImage } from "@/lib/uploadImage.";


interface MapLibreMapHandle {
  handleSearch: () => void;
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const [formattedFecha, setFormattedFecha] = useState("");
  const mapRef = useRef<MapLibreMapHandle>(null)
  const [direccionError, setDireccionError] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState("")
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [direc, setDirec] = useState("");

  const [formData, setFormData] = useState<EditEventFormData>({
    organizerId: event.organizerId,
    titulo: "",
    descripcion: "",
    direccion: "",
    fechaInicio: new Date(),
    fechaFinalizacion: new Date(),
    visibilidad: "público",
    estado: "borrador",
    categorias: [],
    capacidad: 0,
    bannerUrl: "",
    videoUrl: "",
    ubicacion: { lat: 0, lng: 0 },
  })










  // Actualiza formData cuando el evento cambie
  useEffect(() => {
    if (event) {
      setFormData({
        organizerId: event.organizerId,
        titulo: event.titulo || "",
        descripcion: event.descripcion || "",
        direccion: event.direccion || "",
        fechaInicio: event.fechaInicio ? new Date(event.fechaInicio) : new Date(),
        fechaFinalizacion: event.fechaFinalizacion ? new Date(event.fechaFinalizacion) : new Date(),
        visibilidad: event.visibilidad || "público",
        estado: event.estado || "draft" ? "borrador" : event.estado === "published" ? "publicado" : undefined,
        categorias: event.categorias || [],
        capacidad: event.capacidad || 0,
        bannerUrl: event.bannerUrl || "",
        videoUrl: event.videoUrl || "",
        ubicacion: {
          lat: event.ubicacion?.lat ?? 0,
          lng: event.ubicacion?.lng ?? 0,
        },
      })
      setLat(event.ubicacion?.lat ?? 0)
      setLon(event.ubicacion?.lng ?? 0)
      setDirec(event.direccion ?? "")
    }
  }, [event]) // Solo se ejecutará cuando `event` cambie

  useEffect(() => {
      if (formData.fechaInicio) {
      setFormattedFecha(format(new Date(formData.fechaInicio), "PPP", { locale: es }));
    }
    setFormData((prev) => ({
      ...prev,
      direccion: direc,
      ubicacion: {
        lat,
        lng: lon,
      },
    }))
  }, [lat, lon, direc])



  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const url = await uploadImage(file); // Usas tu función personalizada
  if (url) {
    setFormData((prev) => ({
      ...prev,
      bannerUrl: url,
    }));
  } else {
    alert("Error al subir imagen");
  }
};



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  /*
      if (name === "latitude" || name === "longitude") {
        const parsedValue = parseFloat(value)
        if (name === "latitude" || name === "longitude") {
          const parsedValue = parseFloat(value)
          if (!isNaN(parsedValue)) {
            setFormData((prev) => ({
              ...prev,
              ubicacion: {
                lat: name === "latitude" ? parsedValue : prev.ubicacion?.lat ?? 0,
                lng: name === "longitude" ? parsedValue : prev.ubicacion?.lng ?? 0,
              },
            }))
          }
        }
      }
      else if (name === "capacidad") {
        setFormData((prev) => ({
          ...prev,
          capacidad: parseInt(value) || 0,
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
    }
  
  */
  const handleSelectChange = (value: "público" | "privado" | "solo invitación") => {
    setFormData((prev) => ({ ...prev, visibilidad: value }))
  }

  const handleStatusChange = (value: "draft" | "published") => {
    // Conversión de los valores de "draft" y "published" a "borrador" y "publicado"
    const estadoEnEspañol: "borrador" | "publicado" | undefined =
      value === "draft" ? "borrador" : value === "published" ? "publicado" : undefined;

    // Actualizar el estado de 'estado' con el valor correcto
    setFormData((prev) => ({
      ...prev,
      estado: estadoEnEspañol,
    }));
  };

  const handleAddCategory = () => {
    const nuevaCategoria = categoryInput.trim()
    if (categoryInput.trim() && !formData.categorias.includes(categoryInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        categorias: [...prev.categorias, nuevaCategoria],
      }))
      setCategoryInput("")
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((c) => c !== category),
    }))
  }

  const handleDateChange = (name: "fechaInicio" | "fechaFinalizacion", date: Date | undefined) => {
    setFormData((prev) => ({ ...prev, [name]: date }))
  }

  const handleSubmit = async () => {
    if (!event.id) {
      console.error("ID del evento no definido");
      return;
    }

    try {
      // Asegúrate de que `formData.ubicacion` nunca sea `undefined`
      const ubicacion = formData.ubicacion ?? { lat: 0, lng: 0 };

      await editarEvento(event.id, {
        organizerId: formData.organizerId,
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString() : "",
        fechaFinalizacion: formData.fechaFinalizacion ? new Date(formData.fechaFinalizacion).toISOString() : "",
        direccion: formData.direccion,
        visibilidad: formData.visibilidad,
        categorias: formData.categorias,
        capacidad: formData.capacidad,
        estado: formData.estado === "borrador" ? "draft" : "published",
        ubicacion: ubicacion,
        Latitude: String(ubicacion.lat),
        Longitude: String(ubicacion.lng),
        bannerUrl: formData.bannerUrl,
        videoUrl: formData.videoUrl,
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error al editar el evento:", error);
    }
  };
  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título" />
          <Input name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Descripción" />

          <div className="flex gap-2">
            <Input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" />
            
            <Button type="button"
              onClick={() => mapRef.current?.handleSearch()}  >
              Buscar
            </Button>
            
          </div>
          {direccionError && (
                        <p className="text-sm text-red-500">{direccionError}</p>
                      )}
          <div className="space-y-2">
          <Label>Fecha de Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.fechaInicio && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.fechaInicio ? (
                  format(new Date(formData.fechaInicio), "PPP", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white shadow-md rounded-md">
              <Calendar
                mode="single"
                selected={formData.fechaInicio ? new Date(formData.fechaInicio) : undefined}
                onSelect={(date) => handleDateChange("fechaInicio", date)}
                initialFocus
                disabled={{ before: new Date() }}  // 🔒 No permitir fechas pasadas
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Fecha de Finalización */}
        <div className="space-y-2">
  <Label>Fecha de Finalización</Label>
  <Popover>
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        className={cn("w-full justify-start text-left font-normal")}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {formData.fechaFinalizacion ? (
          format(new Date(formData.fechaFinalizacion), "PPP", { locale: es })
        ) : (
          <span>Seleccionar fecha</span>
        )}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-white shadow-md rounded-md">
      <Calendar
        mode="single"
        selected={
          formData.fechaFinalizacion
            ? new Date(formData.fechaFinalizacion)
            : undefined
        }
        onSelect={(date) =>
          handleDateChange("fechaFinalizacion", date ? new Date(date) : undefined)
        }
        initialFocus
        disabled={{
          before: formData.fechaInicio
            ? new Date(formData.fechaInicio)
            : new Date(),
        }}
      />
    </PopoverContent>
  </Popover>
</div>

          <Input name="capacidad" type="number" value={formData.capacidad} onChange={handleChange} />
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="categoryInput"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="Añadir categoría"
              />
              <Button type="button" onClick={handleAddCategory}>
                Añadir
              </Button>
            </div>
            {formData.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.categorias.map((category, index) => (
                  <div key={index} className="flex items-center bg-muted rounded-md px-2 py-1">
                    <span className="text-sm">{category}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 ml-1"
                      onClick={() => handleRemoveCategory(category)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Select value={formData.visibilidad} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar visibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Público</SelectItem>
              <SelectItem value="private">Privado</SelectItem>
              <SelectItem value="invite-only">Solo invitación</SelectItem>
            </SelectContent>
          </Select>

          {/* Select Estado */}
          <Select value={formData.estado} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="borrador">Borrador</SelectItem>
              <SelectItem value="publicado">Publicado</SelectItem>
            </SelectContent>
          </Select>


<div className="mb-6">
  <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">
    Imagen del Banner
  </label>

  {/* Vista previa elegante */}
  {formData.bannerUrl && (
    <div className="mb-3">
      <img
        src={formData.bannerUrl}
        alt="Vista previa"
        className="w-full h-48 object-cover rounded shadow"
      />
    </div>
  )}

  <input
    type="file"
    id="banner"
    accept="image/*"
    onChange={handleImageChange}
    className="block w-full text-sm text-gray-500
               file:mr-4 file:py-2 file:px-4
               file:rounded-md file:border-0
               file:text-sm file:font-semibold
               file:bg-blue-50 file:text-blue-700
               hover:file:bg-blue-100"
  />
</div>


          <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="URL del Video" />
          <Input name="latitude" value={formData.ubicacion?.lat} onChange={handleChange} placeholder="Latitud" />
          <Input name="longitude" value={formData.ubicacion?.lng} onChange={handleChange} placeholder="Longitud" />

          <div className="space-y-2">
            <MapLibreMap 
            direccion={formData.direccion} 
            lat={lat} 
            lon={lon} 
            setDireccion={setDirec} 
            setLati={setLat} 
            setLoni={setLon} 
            ref={mapRef} 
            mode="editar"
            setDireccionError={setDireccionError}
            ></MapLibreMap>

          </div>


          <Button onClick={handleSubmit}>Guardar Cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}