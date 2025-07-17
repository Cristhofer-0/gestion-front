# 🛠️ Gestión Front

Interfaz administrativa para el ecosistema **JoinWithUs**. Este frontend permite a los administradores gestionar eventos, usuarios, tickets, notificaciones y estadísticas desde un panel moderno y funcional, desarrollado con **Next.js**.

<p align="center">
  <img src="https://i.imgur.com/Bf9Y16B.png" alt="JoinWithUs Logo" width="300"/>
</p>

---

## 🚀 Tecnologías Utilizadas

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/) – Manejo de estado global
- [React Hook Form](https://react-hook-form.com/) – Formularios y validación
- [Chart.js / Recharts](https://recharts.org/) – Estadísticas gráficas
- [Socket.IO](https://socket.io/) – Notificaciones en tiempo real
- [MapLibre GL](https://maplibre.org/) – Selección de ubicación para eventos

---

## 📁 Estructura del Proyecto

```
gestion-front/
├── app/                   # Rutas principales de la aplicación
├── components/            # Componentes reutilizables
├── features/              # Módulos: eventos, usuarios, tickets, etc.
├── stores/                # Zustand stores
├── lib/                   # Funciones y servicios auxiliares
├── public/                # Recursos estáticos
└── styles/                # Estilos globales
```

---

## 📦 Instalación

```bash
git clone https://github.com/Cristhofer-0/gestion-front.git
cd gestion-front
npm install
```

---

## 🧪 Uso en Desarrollo

```bash
npm run dev
```

Abrir en: [http://localhost:3002](http://localhost:3002)

---

## 🌐 Variables de Entorno

Crear `.env.local`:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## 🔌 Integración con Backend

Se conecta con [`gestion-back`](https://github.com/Cristhofer-0/gestion-back) y complementa al frontend público [`proyec-tec-front`](https://github.com/Cristhofer-0/proyec-tec-front).

---

## 🔔 Funcionalidades

- 👤 Gestión de usuarios
- 📅 Gestión de eventos (CRUD + publicación)
- 🎫 Control de tickets
- 📊 Dashboard de estadísticas
- 🔔 Notificaciones en tiempo real
- 📍 Selección de ubicación en mapas
- 🧾 Administración de reseñas, cupones, favoritos

---

## 🧹 Scripts Útiles

```bash
npm run dev       # Servidor local
npm run build     # Compilar para producción
npm run lint      # Revisar errores de código
```

---

## ✅ Estado

> En desarrollo activo. Parte del ecosistema de apps conectadas con WebSocket + API REST.

---

## 📄 Licencia

Este proyecto es de uso privado.  
**Está permitido su uso únicamente con fines de exhibición en portafolios personales por parte de sus autores.**  
Queda prohibida su copia, distribución o modificación sin autorización escrita.

© 2025 Cristhofer, Miguel, Franco, Adrian y Sebastian. Todos los derechos reservados.

---

## ✨ Autores

Desarrollado por:  
- [Cristhofer](https://github.com/Cristhofer-0)  
- [Miguel](https://github.com/sevenjpg8)  
- [Franco](https://github.com/LuisFr3)  
- [Adrian](https://github.com/SkipCodeBytes)  
- [Sebastian](https://github.com/sebaslade)
