"use client"

import { useState, useEffect } from "react"
import {
  CheckCircleIcon,
  MailIcon,
  KeyIcon,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { obtenerUsuarioPorEmail, enviarEnlaceReset } from "@/services/usuario"

export default function PasswordResetForm() {
  const [userEmail, setUserEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailError("")

    try {
      const user = await obtenerUsuarioPorEmail(userEmail)
      if (!user) {
        setEmailError("Correo no válido o no registrado")
        toast.error("Correo no encontrado")
        setIsLoading(false)
        return
      }

      await enviarEnlaceReset(userEmail)
      toast.success("Enlace enviado. Revisa tu correo.")
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
      toast.error("Error al enviar el enlace")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">¡Enlace enviado!</CardTitle>
              <CardDescription>Revisa tu correo electrónico para continuar con el restablecimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-sm text-muted-foreground">
                <MailIcon className="inline-block mr-1 h-4 w-4" />
                {userEmail}
              </div>
              <Button className="w-full gap-2" asChild>
                <Link href="/login">
                  <KeyIcon className="h-4 w-4" />
                  Volver al login
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <MailIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
            <CardDescription>Ingresa tu correo para recibir un enlace de restablecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <Input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MailIcon className="h-4 w-4" />
                    Enviar enlace
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 JoinWithUs. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
