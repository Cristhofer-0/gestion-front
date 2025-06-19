import { useState, useEffect, useRef } from "react"
import type { ItemData } from "../types/ItemData"
import type { EditEventFormData } from "./types/EventFormData"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { editarEvento } from "../../../services/eventos" // Asegúrate de que esta función esté definida
import MapLibreMap from "@/components/principales/mapa"
import { Label } from "@/components/ui/label"
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
import { Textarea } from "@/components/ui/textarea"


interface MapLibreMapHandle {
  handleSearch: () => void;
}

export function EditEventDialog({ open, onOpenChange, event }: EditEventDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formattedFecha, setFormattedFecha] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  const mapRef = useRef<MapLibreMapHandle>(null)
  const [direccionError, setDireccionError] = useState<string | null>(null);
  const [categoryInput, setCategoryInput] = useState("")
  const [lat, setLat] = useState(0);
  const [lon, setLon] = useState(0);
  const [direc, setDirec] = useState("");
  const [originalFormData, setOriginalFormData] = useState<EditEventFormData | null>(null);

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
      const initialData = {
        organizerId: event.organizerId,
        titulo: event.titulo || "",
        descripcion: event.descripcion || "",
        direccion: event.direccion || "",
        fechaInicio: event.fechaInicio ? new Date(event.fechaInicio) : new Date(),
        fechaFinalizacion: event.fechaFinalizacion ? new Date(event.fechaFinalizacion) : new Date(),
        visibilidad: event.visibilidad || "público",
        estado: (event.estado === "draft" ? "borrador" : event.estado === "published" ? "publicado" : undefined) as "borrador" | "publicado" | undefined,
        categorias: event.categorias || [],
        capacidad: event.capacidad || 0,
        bannerUrl: event.bannerUrl || "",
        videoUrl: event.videoUrl || "",
        ubicacion: {
          lat: event.ubicacion?.lat ?? 0,
          lng: event.ubicacion?.lng ?? 0,
        },
      };

      setFormData(initialData);
      setOriginalFormData(initialData);  // <-- Aquí guardamos la copia original

      setLat(event.ubicacion?.lat ?? 0);
      setLon(event.ubicacion?.lng ?? 0);
      setDirec(event.direccion ?? "");
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
  setUploadError(null);
  if (!e.target.files?.length) return;

  const file = e.target.files[0];
  const maxSizeInMB = 10;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  let errorMsg = "";

  if (file.type !== "image/webp") {
    errorMsg += "Solo se permiten imágenes en formato .webp.\n";
  }

  if (file.size > maxSizeInBytes) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    errorMsg += `La imagen pesa ${sizeInMB} MB. Máximo permitido: ${maxSizeInMB} MB.`;
  }

  if (errorMsg) {
    setUploadError(errorMsg.trim());
    setFormData((prev) => ({ ...prev, bannerUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    return;
  }

  const imageUrl = await uploadImage(file);
  if (imageUrl) {
    setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }));
    setUploadError(null);
  } else {
    setUploadError("Error al subir imagen.");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleAddCategory = (e: { preventDefault: () => void }) => {
      e.preventDefault();
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

  const handleClose = () => {
    if (originalFormData) {
      setFormData(originalFormData);
      setLat(originalFormData.ubicacion?.lat ?? 0);
      setLon(originalFormData.ubicacion?.lng ?? 0);
      setDirec(originalFormData.direccion);
    }
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
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
        fechaInicio: `${formatDateForInput(formData.fechaInicio)}T00:00:00`, // Para editar y que se muestre correctamente la fecha en el bd y el form
        fechaFinalizacion: `${formatDateForInput(formData.fechaFinalizacion)}T00:00:00`, // Para editarlo y que se muestre correctamente la fecha en el bd y el form
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

    // Función para formatear la fecha para el input date
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return ""
    return date.toISOString().split("T")[0]
  }


  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      } else {
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <Label htmlFor="title">Título</Label>
          <Input name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Título" />
          <Label htmlFor="description">Descripción</Label>
          <Textarea name="descripcion" value={formData.descripcion} onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Descripción" />

          {/* Fecha de Inicio y Fecha de Finalización */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
    <div className="relative">
      <Input
        id="fechaInicio"
        type="date"
        value={formatDateForInput(formData.fechaInicio)}
        onChange={(e) =>
          handleDateChange("fechaInicio", e.target.value ? new Date(e.target.value) : undefined)
        }
        className={cn(formErrors.fechaInicio && "border-red-500")}
        min={formatDateForInput(new Date())}
      />
    </div>
    {formErrors.fechaInicio && (
      <p className="text-sm text-red-500">{formErrors.fechaInicio}</p>
    )}
  </div>

  <div className="space-y-2">
    <Label htmlFor="fechaFinalizacion">Fecha de Finalización</Label>
    <div className="relative">
      <Input
        id="fechaFinalizacion"
        type="date"
        value={formatDateForInput(formData.fechaFinalizacion)}
        onChange={(e) =>
          handleDateChange(
            "fechaFinalizacion",
            e.target.value ? new Date(e.target.value) : undefined
          )
        }
        className={cn(formErrors.fechaFinalizacion && "border-red-500")}
        min={formatDateForInput(formData.fechaInicio || new Date())}
      />
    </div>
    {formErrors.fechaFinalizacion && (
      <p className="text-sm text-red-500">{formErrors.fechaFinalizacion}</p>
    )}
  </div>
</div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <div className="flex gap-2">
              <Input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" />
              <Button type="button" onClick={() => mapRef.current?.handleSearch()}>Buscar</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitud</Label>
              <Input name="latitud" value={formData.ubicacion?.lat} onChange={handleChange} placeholder="Latitud" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitud</Label>
              <Input name="longitud" value={formData.ubicacion?.lng} onChange={handleChange} placeholder="Longitud" />
            </div>
          </div>

          <div className="h-[250px] rounded overflow-hidden mt-4">
            <Label htmlFor="map" className="mb-2 block">MAPA</Label>
            <MapLibreMap
              direccion={formData.direccion}
              lat={lat}
              lon={lon}
              setDireccion={setDirec}
              setLati={setLat}
              setLoni={setLon}
              ref={mapRef}
              mode="crear"
              setDireccionError={setDireccionError}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad</Label>
              <Select value={formData.visibilidad} onValueChange={handleSelectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Público</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.estado === "borrador" ? "draft" : "published"} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categorías</Label>
            <div className="flex gap-2">
              <Input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Añadir categoría" />
              <Button onClick={handleAddCategory}>Añadir</Button>
            </div>
            {formData.categorias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.categorias.map((cat, idx) => (
                  <div key={idx} className="flex items-center bg-muted rounded px-2 py-1">
                    <span>{cat}</span>
                    <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1" onClick={() => handleRemoveCategory(cat)}>×</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banner y Video URL */}
          <div className="mb-6">
            <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">
              Imagen del Banner
            </label>

            {formData.bannerUrl && (
              <div className="mb-3">
                <img
                  src={formData.bannerUrl}
                  alt="Vista previa"
                  style={{ maxWidth: "100%", marginTop: "1rem" }}
                />
              </div>
            )}

            <input
              ref={fileInputRef}
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
            {uploadError && (
              <ul className="text-sm text-red-500 mt-2 space-y-1">
                {uploadError.split("\n").map((msg, index) => (
                  <li key={index}>• {msg}</li>
                ))}
              </ul>
            )}
          </div>
          <Label htmlFor="videoUrl">URL del Video</Label>
          <Input name="videoUrl" value={formData.videoUrl} onChange={handleChange} placeholder="URL del Video" />

          <Label htmlFor="capacity">Capacidad</Label>
          <Input name="capacidad" type="number" value={formData.capacidad} onChange={handleChange} placeholder="Capacidad" />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Guardar cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

  )
}

