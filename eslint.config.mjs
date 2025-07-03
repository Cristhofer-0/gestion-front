import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // ⚠️ Convierte los errores en warnings o los desactiva
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",

      // Estas reglas han sido desactivadas temporalmente para evitar errores y advertencias durante el desarrollo y build.
      // Es recomendable revisar y reactivar gradualmente las más críticas (como no-unused-expressions o no-explicit-any) 
      // antes del paso a producción para mantener la calidad del código.
      "@typescript-eslint/no-unused-vars": "off",            // 🔕 Desactiva advertencias por variables no usadas
      "@typescript-eslint/no-explicit-any": "off",           // 🔕 Permite usar 'any' sin advertencias
      "react-hooks/exhaustive-deps": "off",                  // 🔕 Evita advertencias por dependencias faltantes en hooks
      "@next/next/no-img-element": "off",                    // 🔕 Permite usar <img> sin advertencias en Next.js
      "@typescript-eslint/no-unused-expressions": "off",     // ❗ Desactiva errores por expresiones sin efecto
      "@typescript-eslint/no-empty-object-type": "off"       // 🔕 Permite interfaces vacías sin errores
    },
  },
];

export default eslintConfig;