"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-black opacity-90"></div>

            {/* Floating elements (más tenues para mantener el tema oscuro) */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>

            {/* Main content */}
            <div className="relative z-10 max-w-2xl mx-auto">
                {/* 404 Number */}
                <div className="mb-8">
                    <h1 className="text-9xl md:text-[12rem] font-black text-white opacity-10 leading-none animate-pulse">
                        404
                    </h1>
                </div>

                {/* Error message */}
                <div className="mb-8 space-y-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Página no encontrada
                    </h2>
                    <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed">
                        La ruta a la que intentaste acceder no existe o fue eliminada.
                    </p>
                </div>

                {/* Search suggestion */}
                <div className="mb-8 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center justify-center gap-2 text-gray-300 mb-2">
                        <Search className="w-5 h-5" />
                        <span className="text-sm">¿Buscabas algo específico?</span>
                    </div>
                    <p className="text-xs text-gray-500">
                        Verifica la URL o regresa al dashboard para continuar navegando
                    </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={() => {
                            const isLogged = document.cookie.includes("loggedUser=");
                            if (isLogged) {
                                window.location.href = "/dashboard";
                            } else {
                                window.location.href = "/login";
                            }
                        }}
                        size="lg"
                        className="bg-black hover:bg-neutral-900 text-white border border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                        <div className="flex items-center gap-2">
                            <Home className="w-5 h-5" />
                            Volver al Dashboard
                        </div>
                    </Button>
                </div>

                {/* Additional help */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm">
                        Si el problema persiste, contacta al soporte técnico
                    </p>
                </div>
            </div>

            {/* Bottom decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10"></div>
        </div>
    )
}
