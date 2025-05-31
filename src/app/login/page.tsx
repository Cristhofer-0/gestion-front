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
        <div className="flex justify-center items-center bg-slate-100 h-full md:min-h-screen p-4">
            <div className="grid justify-center max-w-md mx-auto">
                <div>
                    <Image src="/login.png" alt='login-image' width={500} height={100} className="w-full object-cover rounded-2xl" />
                </div>

                <form onSubmit={handleSubmit(verificarCorreo)} className="bg-white rounded-2xl p-6 -mt-14 relative z-10 shadow-[0_2px_16px_-3px_rgba(6,81,237,0.3)]">
                    <div className="mb-12">
                        <h3 className="text-3xl font-bold text-blue-600">Iniciar sesión</h3>
                    </div>

                    {/* INPUT CORREO */}
                    <div className="space-y-1">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className={`w-full text-slate-800 text-sm border-b border-slate-300 focus:border-blue-600 px-2 py-3 pr-8 outline-none
                                ${emailLleno ? 'opacity-100' : 'opacity-50'} transition-all duration-300 ease-in-out transform`}
                                {...register("email", {
                                    required: true,
                                    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i
                                })}
                                placeholder="ejemplo@ejemplo.com"
                            />
                            <IoMailOutline className="w-[24px] h-[24px] absolute right-1" />
                        </div>
                        <div className="min-h-[1.25rem] transition-all duration-300 ease-in-out transform">
                            <div className="min-h-[1.25rem] transition-all duration-300 ease-in-out transform">
                                <span
                                    className={`block text-red-600 text-sm transition-all duration-300 ease-in-out transform ${errors.email
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 -translate-y-1 pointer-events-none select-none'
                                        }`}
                                >
                                    {errors.email?.type === "required" && "El correo electrónico no debe estar vacío"}
                                    {errors.email?.type === "pattern" && "El correo electrónico no es válido"}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* INPUT CONTRASEÑA */}
                    <div className="space-y-1">
                        <div className="relative flex items-center">


                            {emailLleno ? (<Input type={mostrarPassword ? "text" : "password"}
                                {...register("password", {
                                    required: true,
                                    minLength: 6,
                                    maxLength: 20,
                                })} placeholder='Ingresar contraseña' className="w-full text-slate-800 text-sm border-b border-slate-300 px-2 py-3 pr-8 outline-none placeholder-red-500"
                            />) : (
                                <Input disabled type="password" placeholder="Ingrese su correo electronico primero" className="w-full text-red-800 text-sm border-b border-slate-300 px-2 py-3 pr-8 outline-none placeholder-red-500" />
                            )}

                            {mostrarPassword ? (
                                <FaRegEye className="w-[24px] h-[24px] absolute right-1 cursor-pointer" onClick={verContaseña} />
                            ) : (
                                <FaRegEyeSlash className="w-[24px] h-[24px] absolute right-1 cursor-pointer" onClick={verContaseña} />
                            )}
                        </div>
                        <div className="min-h-[1.25rem] transition-all duration-300 ease-in-out transform">
                            <div className="min-h-[1.25rem] transition-all duration-300 ease-in-out transform">
                                <span
                                    className={`block text-red-600 text-sm transition-all duration-300 ease-in-out transform ${errors.password
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 -translate-y-1 pointer-events-none select-none'
                                        }`}
                                >
                                    {errors.password?.type === "required" && "La contraseña no debe estar vacía"}
                                    {errors.password?.type === "minLength" && "La contraseña debe tener al menos 6 caracteres"}
                                    {errors.password?.type === "maxLength" && "La contraseña no debe exceder los 20 caracteres"}
                                </span>
                            </div>

                        </div>
                        {/* RECORDAR Y OLVIDAR */}
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" />
                                <label htmlFor="remember-me" className="text-slate-800 ml-3 block text-sm">
                                    Recuérdame
                                </label>
                            </div>
                            <div>
                                <a href="javascript:void(0);" className="text-blue-600 text-sm font-medium hover:underline">
                                    ¿Olvidaste la contraseña?
                                </a>
                            </div>
                        </div>
                    </div>

                      {/* Span para mostrar error de login */}
                    {errorLogin && (
                        <div className="my-4">
                            <span className="text-red-600 text-sm">{errorLogin}</span>
                        </div>
                    )}


                    <hr className="my-6 border-slate-300" />

                    <div className="space-x-8 flex justify-center">
                        <Button type='submit' variant="default" className="btn btn-primary text-blue-500 block bg-green-400 hover:bg-green-700">
                            Iniciar sesión
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
