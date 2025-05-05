"use client"

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';

// ICONOS
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { IoMailOutline } from "react-icons/io5";

interface LoginData {
    email: string;
    password: string;
}

export default function Login() {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
    const router = useRouter();
    const [mostrarPassword, setMostrarPassword] = useState(false);

    async function verificarCorreo(data: LoginData): Promise<void> {
        try {
            const response = await fetch("https://api.example.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok || response.json() === null) {
                console.log("Error en la respuesta de la API:", response.statusText);
                throw new Error("Correo y/o contraseña incorrectos");
            }

            router.push("/dashboard");

        } catch (error: unknown) {
            console.error("Error:", error);
        }
    }

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

                    <div className="space-y-6">
                    </div>

                    {/* INPUT CORREO */}
                    <div className="space-y-1">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                className="w-full text-slate-800 text-sm border-b border-slate-300 focus:border-blue-600 px-2 py-3 pr-8 outline-none"
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
                            <input
                                type={mostrarPassword ? "text" : "password"}
                                {...register("password", {
                                    required: true,
                                    minLength: 6,
                                    maxLength: 20,
                                })}
                                className="w-full text-slate-800 text-sm border-b border-slate-300 focus:border-blue-600 px-2 py-3 pr-8 outline-none"
                                placeholder="Ingresar contraseña"
                            />
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
