"use client"

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// ICONOS
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoMailOutline } from "react-icons/io5";
import { Link } from 'lucide-react';

interface LoginData {
    email: string;
    password: string;
}

export default function Login() {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginData>();
    const router = useRouter();
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [emailLleno, setEmailLleno] = useState(false);
     const [errorLogin, setErrorLogin] = useState<string | null>(null); 

    const valorEmail = watch("email");

    useEffect(() => {
        setEmailLleno((valorEmail || "").trim() !== "");
    }, [valorEmail]);


    async function verificarCorreo(data: LoginData): Promise<void> {
        try {
            const url = new URL("http://localhost:3000/usuarios/login");

            const response = await fetch(url.toString(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                }),
            });

            const responseData = await response.json();

            if (!response.ok || !responseData) {
                throw new Error(responseData?.message || "Error desconocido al iniciar sesión");
            }

            // Verificar rol del usuario
            if (responseData.user?.Role === "user") {
                setErrorLogin("No tienes permisos para acceder al dashboard.");
                return;
            }

            // Guardar cookie básica (puedes reemplazar con JWT o HttpOnly cookie más adelante)
            document.cookie = `loggedUser=true; path=/`;
            localStorage.setItem("user", JSON.stringify(responseData));
            router.push("/dashboard");

        } catch (error: unknown) {
            console.error("Error:", error);
        }
    }
    //FUNCION PARA MOSTRAR/OCULTAR LA CONTRASEÑA
    function verContaseña() {
        setMostrarPassword(prev => !prev);
    }



    return (
        <div className="min-h-screen bg-black text-white">
            {/* Navigation */}
            <nav className="hidden lg:flex lg:w-1/2 items-end p-12 bg-[#0e0e0e]">
                <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-white rounded-sm flex items-center justify-center">
                    <div className="h-3 w-3 bg-black rounded-sm"></div>
                </div>
                <span className="text-lg font-semibold">JoinWithUs</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex min-h-[calc(96.1vh-88px)]">
                {/* Left side - Testimonial */}
                <div className="hidden lg:flex lg:w-1/2 items-end p-12 bg-[#0e0e0e]">
                    <blockquote className="text-lg">
                        <p className="mb-4">
                        "Gracias a JoinWithUs ahora gestiono todos mis eventos desde un solo lugar, de forma rápida, clara y sin complicaciones."
                        </p>
                        <footer className="text-sm text-gray-400">- Ana Martinez</footer>
                    </blockquote>
                </div>

                {/* Right side - Form */}
                <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
                <form
                    onSubmit={handleSubmit(verificarCorreo)}
                    className="w-full max-w-sm space-y-6"
                >
                    <div className="space-y-2 text-center">
                    <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
                    <p className="text-sm text-gray-400">Ingresa tu correo y contraseña</p>
                    </div>

                    <div className="space-y-4">
                    {/* CORREO */}
                    <div className="relative">
                        <Input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pr-10"
                        {...register("email", {
                            required: true,
                            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i
                        })}
                        />
                        <IoMailOutline className="w-5 h-5 absolute right-3 top-3 text-white" />
                        {errors.email && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.email.type === "required" && "El correo es obligatorio"}
                            {errors.email.type === "pattern" && "Formato de correo inválido"}
                        </p>
                        )}
                    </div>

                    {/* CONTRASEÑA */}
                    <div className="relative">
                        <Input
                        type={mostrarPassword ? "text" : "password"}
                        placeholder={emailLleno ? "Tu contraseña" : "Primero ingresa el correo"}
                        disabled={!emailLleno}
                        className={`bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 h-12 pr-10 ${!emailLleno ? "text-red-400" : ""}`}
                        {...register("password", {
                            required: true,
                            minLength: 6,
                            maxLength: 20
                        })}
                        />
                        {mostrarPassword ? (
                        <FaRegEye
                            className="w-5 h-5 absolute right-3 top-3 text-white cursor-pointer"
                            onClick={verContaseña}
                        />
                        ) : (
                        <FaRegEyeSlash
                            className="w-5 h-5 absolute right-3 top-3 text-white cursor-pointer"
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

                    {/* ERROR DE LOGIN */}
                    {errorLogin && (
                        <p className="text-red-500 text-sm text-center">{errorLogin}</p>
                    )}

                    {/* BOTÓN LOGIN */}
                    <Button
                        type="submit"
                        className="w-full h-12 bg-white text-black hover:bg-gray-100"
                    >
                        Iniciar sesión
                    </Button>
                    </div>

                    {/* ENLACES */}

                    {/* <p className="text-xs text-center text-gray-400">
                    Al continuar, aceptas nuestros{" "}
                    <Link href="/terms" className="underline hover:text-white">
                        Términos de servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="/privacy" className="underline hover:text-white">
                        Política de privacidad
                    </Link>
                    .
                    </p> */}
                </form>
                </div>
            </div>
            </div>
    );
}
