"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg bg-white text-black">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Bienvenido</CardTitle>
            <CardDescription className="text-lg">Sistema de gestión de JoinWithUs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Link href="/login" className="w-full">
              <Button className="w-full h-16 text-lg bg-black text-white hover:bg-zinc-800">
                <LogIn className="mr-2 h-5 w-5" />
                Iniciar Sesión
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
