import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, LogIn } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      
      <Card className="w-full max-w-md shadow-lg">
        
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Bienvenido</CardTitle>
          <CardDescription className="text-lg">Sistema de gestion de JoinWithUs</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Link href="/login" className="w-full">
            <Button className="w-full h-16 text-lg" size="lg">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar Sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  )
}
