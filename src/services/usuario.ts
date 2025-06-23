import { UsuarioData } from "@/components/DataTable/types/UsuarioData"
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
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
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