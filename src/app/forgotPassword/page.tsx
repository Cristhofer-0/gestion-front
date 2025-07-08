"use client"

import type React from "react"
import { useState } from "react"
import {
  ArrowLeftIcon,
  ArrowUpCircleIcon,
  CheckCircleIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { obtenerUsuarioPorEmail, cambiarPassword } from "@/services/usuario" // Asegúrate de ajustar la ruta

export default function DirectPasswordResetForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailError, setEmailError] = useState("") // 👈 añade este estado arriba

  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  // 🔧 Aquí debes obtener el userId de donde lo tengas (por ejemplo, desde la URL, store, props, etc.)
  const userId = 1 // Cambia esto por la fuente real de userId

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const passwordRequirements = [
    { text: "Al menos 8 caracteres", met: formData.newPassword.length >= 8 },
    { text: "Una letra mayúscula", met: /[A-Z]/.test(formData.newPassword) },
    { text: "Una letra minúscula", met: /[a-z]/.test(formData.newPassword) },
    { text: "Un número", met: /\d/.test(formData.newPassword) },
    { text: "Un carácter especial", met: /[!@#$%^&*(),.?\":{}|<>]/.test(formData.newPassword) },
  ]

  const getPasswordStrength = () => {
    const met = passwordRequirements.filter((r) => r.met).length
    return (met / passwordRequirements.length) * 100
  }

  const getPasswordStrengthText = () => {
    const s = getPasswordStrength()
    if (s === 0) return ""
    if (s <= 40) return "Débil"
    if (s <= 60) return "Regular"
    if (s <= 80) return "Buena"
    return "Muy fuerte"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await obtenerUsuarioPorEmail(formData.email)
      const userId = user.UserId // Asegúrate que sea `UserId` y no `id`
      setEmailError("") // limpiar error previo

      // Validaciones de contraseñas...
      if (!formData.newPassword || !formData.confirmPassword) {
        toast.error("Completa todos los campos de contraseña")
        setIsLoading(false)
        return
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Las contraseñas no coinciden")
        setIsLoading(false)
        return
      }

      const unmet = passwordRequirements.filter((r) => !r.met)
      if (unmet.length > 0) {
        toast.error("La contraseña no cumple con los requisitos")
        setIsLoading(false)
        return
      }

      await cambiarPassword({
        userId: userId.toString(),
        newPassword: formData.newPassword,
        requireCurrent: false,
      })

      toast.success("¡Contraseña restablecida exitosamente!")
      setIsSuccess(true)
    } catch (error) {
      setEmailError("Este correo no existe")
      toast.error("Correo no encontrado")
    } finally {
      setIsLoading(false)
    }
  }
  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center">
            <Link href="/" className="flex items-center gap-2">
              <ArrowUpCircleIcon className="h-8 w-8" />
              <span className="text-xl font-semibold">Acme Inc.</span>
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">¡Contraseña Restablecida!</CardTitle>
              <CardDescription>Ya puedes iniciar sesión con tu nueva contraseña.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted/50 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                  <MailIcon className="h-4 w-4" />
                  <span>Correo:</span>
                </div>
                <p className="font-medium">{formData.email}</p>
              </div>

              <Button className="w-full gap-2" asChild>
                <Link href="/login">
                  <KeyIcon className="h-4 w-4" />
                  Iniciar Sesión
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Acme Inc. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowUpCircleIcon className="h-8 w-8" />
            <span className="text-xl font-semibold">Acme Inc.</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <KeyIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Restablecer Contraseña</CardTitle>
            <CardDescription>Ingresa tu nueva contraseña</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (opcional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  placeholder="tu@correo.com"
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isLoading}
                  >
                    {showNewPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>

                {formData.newPassword && (
                  <>
                    <Progress value={getPasswordStrength()} className="h-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Fortaleza: {getPasswordStrengthText()}
                    </p>
                  </>
                )}

                {formData.newPassword && (
                  <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium">Requisitos:</p>
                    {passwordRequirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded-full ${req.met ? "bg-green-500" : "bg-muted"
                            }`}
                        >
                          {req.met && <CheckIcon className="h-3 w-3 text-white" />}
                        </div>
                        <span className={req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <KeyIcon className="h-4 w-4" />
                    Restablecer Contraseña
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 Acme Inc. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
