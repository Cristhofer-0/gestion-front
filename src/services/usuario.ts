import { UsuarioData } from "@/components/DataTable/types/UsuarioData"
import { UsuarioDataPerfil } from "@/components/DataTable/types/UsuarioDataPerfil"
import { CambioPasswordData } from "@/components/DataTable/types/CambioPasswordData"

export async function editarUsuario(usuario: UsuarioData): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      FullName: usuario.fullName,
      Email: usuario.email,
      Phone: usuario.phone,
      Role: usuario.role,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error en la respuesta de la API:", errorText)
    throw new Error("No se pudo editar el usuario")
  }
}

export async function editarUsuarioPerfil(usuario: UsuarioDataPerfil): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/usuarios/${usuario.userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      FullName: usuario.fullName,
      Email: usuario.email,
      Phone: usuario.phone,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error en la respuesta de la API:", errorText)
    throw new Error("No se pudo editar el usuario")
  }
}


export async function cambiarPassword(data: CambioPasswordData): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/usuarios/${data.userId}/cambiar-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      currentPassword: data.currentPassword || "", // fallback por si no se pasa
      newPassword: data.newPassword,
      requireCurrent: data.requireCurrent ?? true, // ✅ si no se manda, asume true por defecto
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Error:", errorText)
    throw new Error("No se pudo cambiar la contraseña")
  }
}

export async function fetchUsuarios(): Promise<UsuarioData[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/usuarios`)

  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de usuarios")
  }

  const rawData = await response.json()

  const usuarios: UsuarioData[] = rawData.map((user: any) => ({
    userId: user.UserId.toString(),
    fullName: user.FullName,
    birthDate: user.BirthDate,
    phone: user.Phone,
    dni: user.DNI,
    email: user.Email,
    role: user.Role,
  }))

  return usuarios
}

export async function obtenerUsuarioPorEmail(email: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const url = `${API_BASE_URL}/usuarios/por-email/${encodeURIComponent(email)}`
  console.log("📡 GET:", url)

  const res = await fetch(url)
  if (!res.ok) {
    const text = await res.text()
    console.error("❌ Backend respondió mal:", text)
    throw new Error("Usuario no encontrado")
  }
  const data = await res.json()
  return data
}