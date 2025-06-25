"use client"
    
import { ArrowLeftIcon, ArrowUpCircleIcon, MailIcon, MessageCircleIcon, PhoneIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function ForgotPasswordContent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <ArrowUpCircleIcon className="h-8 w-8" />
            <span className="text-xl font-semibold">JoinWithUs</span>
          </Link>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription>
              No te preocupes, nuestro equipo de soporte te ayudará a recuperar el acceso a tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Instructions */}
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="font-medium text-foreground mb-2">Para recuperar tu contraseña:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Contacta a nuestro equipo de soporte usando cualquiera de los métodos a continuación</li>
                  <li>Proporciona tu dirección de email registrada</li>
                  <li>Verifica tu identidad con la información solicitada</li>
                  <li>Recibirás instrucciones para crear una nueva contraseña</li>
                </ol>
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-center">Información de Contacto</h3>

              <div className="space-y-3">
                {/* Email Support */}
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MailIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Email de Soporte</p>
                    <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:sebastianlaos2b@gmail.com">Contactar</a>
                  </Button>
                </div>

                {/* Phone Support */}
                <div className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <PhoneIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Teléfono de Soporte</p>
                    <p className="text-sm text-muted-foreground">Lun - Vie, 9:00 AM - 6:00 PM</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href="tel:+1-555-0123">Llamar</a>
                  </Button>
                </div>
              </div>
            </div>
            <Separator />

            {/* Back to Login */}
            <div className="pt-4">
              <Button variant="outline" className="w-full gap-2" asChild>
                <Link href="/login">
                  <ArrowLeftIcon className="h-4 w-4" />
                  Volver al Inicio de Sesión
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 JoinWithUs Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
