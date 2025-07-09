"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useState } from "react"
import { fetchReviews } from "@/services/reviews"
import { StarRating } from "@/components/custom/star-ratingProps"
import { motion } from "framer-motion"
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { IoMailOutline } from "react-icons/io5"
import Image from "next/image"
import Link from "next/link"

interface LoginData {
  email: string
  password: string
}

export default function Login() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginData>()
  const router = useRouter()
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [emailLleno, setEmailLleno] = useState(false)
  const [errorLogin, setErrorLogin] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const [testimonios, setTestimonios] = useState<{ id: string; texto: string; autor: string; rating: number }[]>([])
  const [testimonioActual, setTestimonioActual] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const valorEmail = watch("email")

  useEffect(() => {
    setEmailLleno((valorEmail || "").trim() !== "")
  }, [valorEmail])

  useEffect(() => {
    async function obtenerReviews() {
      try {
        const reviews = await fetchReviews()
        const testimoniosFormateados = reviews.map((r) => ({
          id: r.id?.toString() ?? "",
          texto: r.comment,
          autor: `${r.name}`,
          rating: Number(r.rating),
        }))
        setTestimonios(testimoniosFormateados)
      } catch (error) {
        console.error("Error al obtener testimonios:", error)
      }
    }
    obtenerReviews()
  }, [])

  useEffect(() => {
    if (testimonios.length === 0) return
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setTestimonioActual((prev) => (prev + 1) % testimonios.length)
        setIsTransitioning(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonios])

  async function verificarCorreo(data: LoginData): Promise<void> {
    setCargando(true)
    setErrorLogin(null)
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/usuarios/login`)
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok || !responseData) {
        throw new Error(responseData?.message || "Error desconocido al iniciar sesión")
      }

      if (responseData.user?.Role === "user") {
        setErrorLogin("No tienes permisos para acceder al dashboard.")
        return
      }

      document.cookie = `loggedUser=true; path=/`
      localStorage.setItem("user", JSON.stringify(responseData))
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Error:", error)
      setErrorLogin("Correo o contraseña incorrectos")
    } finally {
      setCargando(false)
    }
  }

  function verContaseña() {
    setMostrarPassword((prev) => !prev)
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white flex flex-col lg:flex-row">
      {/* Sección Carrusel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0e0e0e]"
      >
        <nav className="mb-6">
          <div className="flex items-center space-x-2">
            <Image
              src="/logonew.png"
              alt="JoinWithUs Logo"
              width={35}
              height={35}
              className="rounded-sm"
            />
            <span className="text-lg font-semibold">JoinWithUs</span>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center">
          {testimonios.length > 0 ? (
            <div className={`transition-all duration-300 ease-in-out transform ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>
              <blockquote className="text-lg leading-relaxed max-w-md">
                <div className="mb-6">
                  <svg className="w-8 h-8 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <p className="mb-6 text-gray-100">{testimonios[testimonioActual].texto}</p>
                <footer className="border-t border-gray-700 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonios[testimonioActual].autor.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{testimonios[testimonioActual].autor}</p>
                      <div className="text-sm text-gray-400">
                        <StarRating rating={testimonios[testimonioActual].rating} />
                      </div>
                    </div>
                  </div>
                </footer>
              </blockquote>

              <div className="flex justify-center space-x-2 mt-8">
                {testimonios.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsTransitioning(true)
                      setTimeout(() => {
                        setTestimonioActual(index)
                        setIsTransitioning(false)
                      }, 300)
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${index === testimonioActual ? "bg-white w-8" : "bg-gray-600 hover:bg-gray-400"}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center">Cargando testimonios...</p>
          )}
        </div>
      </motion.div>

      {/* Sección Login */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8"
      >
        <form onSubmit={handleSubmit(verificarCorreo)} className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
            <p className="text-sm text-gray-400">Ingresa tu correo y contraseña</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Input
                type="email"
                placeholder="ejemplo@correo.com"
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pr-10"
                {...register("email", {
                  required: true,
                  pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i,
                })}
              />
              <IoMailOutline className="absolute right-3 top-3 w-5 h-5 text-white" />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.type === "required" && "El correo es obligatorio"}
                  {errors.email.type === "pattern" && "Formato de correo inválido"}
                </p>
              )}
            </div>

            <div className="relative">
              <Input
                type={mostrarPassword ? "text" : "password"}
                placeholder={emailLleno ? "Tu contraseña" : "Primero ingresa el correo"}
                disabled={!emailLleno}
                className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pr-10 ${!emailLleno ? "text-red-400" : ""}`}
                {...register("password", {
                  required: true,
                  minLength: 6,
                  maxLength: 20,
                })}
              />
              {mostrarPassword ? (
                <FaRegEye
                  className="absolute right-3 top-3 w-5 h-5 text-white cursor-pointer"
                  onClick={verContaseña}
                />
              ) : (
                <FaRegEyeSlash
                  className="absolute right-3 top-3 w-5 h-5 text-white cursor-pointer"
                  onClick={verContaseña}
                />
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.type === "required" && "La contraseña es obligatoria"}
                  {errors.password.type === "minLength" && "Mínimo 6 caracteres"}
                  {errors.password.type === "maxLength" && "Máximo 20 caracteres"}
                </p>
              )}
            </div>

            {errorLogin && <p className="text-red-500 text-sm text-center">{errorLogin}</p>}

            <Button
              type="submit"
              className="w-full h-12 cursor-pointer bg-white text-black hover:bg-gray-100"
              disabled={cargando}
            >
              {cargando ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin spin-slow" />
                  Cargando...
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            <div className="text-center mt-2">
              <Link href="/forgotPassword" className="text-sm text-white hover:text-gray-400 no-underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
