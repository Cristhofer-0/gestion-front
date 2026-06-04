import { ReviewData } from "@/components/DataTable/types/ReviewData"

export async function fetchReviews(): Promise<ReviewData[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const response = await fetch(`${API_BASE_URL}/reviews`)

  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de reviews")
  }

  const rawData = await response.json()

  const reviews: ReviewData[] = rawData.map((data: any) => ({
    id: data.ReviewId.toString(),
    userId: data.UserId,
    name: data.User?.FullName ?? "Usuario Anónimo",
    role: data.User?.Role ?? "Rol Desconocido",
    rating: data.Rating,
    comment: data.Comment,
  }))

  return reviews
}