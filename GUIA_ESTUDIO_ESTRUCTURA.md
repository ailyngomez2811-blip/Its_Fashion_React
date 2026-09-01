# 📚 Guía de Estudio: Arquitectura y Estructura del Proyecto (Its Fashion)

Esta guía detalla la arquitectura, el propósito de cada carpeta y archivo, y las preguntas típicas de evaluación teórica/práctica para tu sustentación.

---

## 🏗️ 1. Arquitectura General (MERN Stack)

El proyecto utiliza una arquitectura desacoplada **Cliente-Servidor**:
- **Backend (Servidor API):** Node.js + Express + MongoDB (Mongoose) bajo arquitectura **MVC** (Modelo-Controlador-Rutas).
- **Frontend (Cliente Web):** React (SPA - Single Page Application) + Tailwind CSS + Axios.

```
Its_Fashion_React/
├── backend/               # Servidor REST API y Lógica del Negocio
└── frontend/              # Interfaz de Usuario en React
```

---

## 🗄️ 2. Estructura del Backend (`/backend`)

El backend sigue el patrón de diseño **MVC**:

```
backend/
├── config/                # Configuraciones externas (Conexión a BD, variables)
│   └── db.js              # Conexión a MongoDB con Mongoose (mongoose.connect)
├── controllers/           # LÓGICA DE NEGOCIO (Qué hace cada petición)
│   ├── authController.js          # Registro, Login, recuperación de contraseñas con JWT
│   ├── productController.js       # CRUD de productos, alertas de stock mínimo
│   ├── categoryController.js      # CRUD y gestión de categorías de ropa
│   ├── saleController.js          # Procesamiento de ventas y descuento de inventario
│   ├── purchaseController.js      # Compras a proveedores y aumento de stock
│   ├── returnController.js        # Devoluciones de productos
│   ├── cashRegisterController.js  # Apertura, arqueo y cierre de caja
│   ├── supplierController.js      # Gestión de proveedores
│   └── reportController.js        # Generación de reportes y métricas financieras
├── middleware/            # FUNCIONES INTERMEDIAS (Seguridad y filtros)
│   └── authMiddleware.js  # Valida el Token JWT y verifica los roles (Admin, Empleado, Cliente)
├── models/                # ESQUEMAS DE BASE DE DATOS (Mongoose Schemas)
│   ├── User.js            # Modelo de usuarios (roles, contraseñas hasheadas)
│   ├── Product.js         # Modelo de producto (código, precio, stock, categoría)
│   ├── Category.js        # Categorías de prendas
│   ├── Sale.js            # Registro de ventas, totales y detalles de productos
│   ├── Purchase.js        # Registro de compras a proveedores
│   ├── Return.js          # Registro de devoluciones y motivos
│   ├── CashRegister.js    # Sesiones de caja diaria y movimientos de efectivo
│   ├── Supplier.js        # Información de proveedores
│   └── InventoryHistory.js# Kardex / Historial de movimientos de inventario
├── routes/                # DEFINICIÓN DE ENDPOINTS / RUTAS
│   ├── authRoutes.js      # /api/auth (login, register, forgot-password)
│   ├── productRoutes.js   # /api/products
│   ├── saleRoutes.js      # /api/sales
│   └── ...                # Cada entidad tiene su archivo de rutas
├── .env                   # Variables de entorno secretas (PORT, MONGO_URI, JWT_SECRET)
├── server.js              # PUNTO DE ENTRADA del Backend (inicia Express y middlewares globales)
└── package.json           # Dependencias del backend (express, mongoose, bcryptjs, jsonwebtoken, etc.)
```

### 🧠 Conceptos Clave del Backend:
1. **`server.js`:** Es el archivo principal. Configura Express, middlewares globales (`cors`, `express.json`), conecta la base de datos y monta las rutas (`app.use('/api/...', routes)`).
2. **Flujo de una petición:** 
   `Petición HTTP` ➡️ `Ruta (routes/)` ➡️ `Middleware (authMiddleware.js)` ➡️ `Controlador (controllers/)` ➡️ `Modelo (models/)` ➡️ `Base de Datos (MongoDB)`.
3. **Seguridad:**
   - **`bcryptjs`:** Encripta las contraseñas antes de guardarlas en BD.
   - **`jsonwebtoken (JWT)`:** Genera y valida tokens para mantener sesiones seguras sin guardar estado en el servidor (Stateless).

---

## 🎨 3. Estructura del Frontend (`/frontend`)

El frontend está construido con React mediante componentes modulares y reutilizables:

```
frontend/
├── public/                # Archivos estáticos y públicos
│   ├── index.html         # Único archivo HTML donde React se monta (<div id="root"></div>)
│   └── favicon.ico        # Ícono de la pestaña
├── src/                   # CÓDIGO FUENTE DE REACT
│   ├── components/        # Componentes reutilizables de UI
│   │   ├── Navbar.jsx     # Barra de navegación superior
│   │   ├── Sidebar.jsx    # Menú lateral adaptable por roles
│   │   ├── Modal.jsx      # Ventanas modales reutilizables
│   │   └── ProtectedRoute.jsx # Protección de rutas según autenticación y rol
│   ├── context/           # Estado Global (React Context API)
│   │   └── AuthContext.jsx# Almacena el usuario logueado, token y estado de sesión global
│   ├── pages/             # VISTAS / PÁGINAS PRINCIPALES
│   │   ├── Welcome.jsx    # Landing page / Bienvenida pública
│   │   ├── auth/          # Login, Registro, Recuperación
│   │   ├── admin/         # Vistas del Administrador (Dashboard, Inventario, Reportes, Usuarios)
│   │   ├── empleado/      # Vistas del Empleado (Punto de Venta POS, Registro de Ventas, Caja)
│   │   └── cliente/       # Vistas de Cliente (Catálogo de productos, Compras)
│   ├── services/          # Conexión con el Backend (API Calls)
│   │   ├── api.js         # Instancia configurada de Axios (baseURL, interceptores de JWT)
│   │   ├── authService.js # Peticiones de login/logout/registro
│   │   ├── productService.js # Peticiones GET, POST, PUT, DELETE de productos
│   │   └── ...
│   ├── App.jsx            # Enrutador principal (React Router - definición de todas las rutas)
│   ├── index.js           # Punto de entrada de React (monta <App /> en el DOM)
│   └── index.css          # Estilos globales y utilidades de Tailwind CSS
├── tailwind.config.js     # Configuración de diseño y colores de Tailwind
└── package.json           # Dependencias del frontend (react, react-router-dom, axios, lucide-react)
```

### 🧠 Conceptos Clave del Frontend:
1. **`index.html` & `index.js`:** Es una SPA. React inyecta toda la aplicación en el `<div id="root"></div>` del `index.html`.
2. **`AuthContext.jsx`:** Permite que cualquier componente sepa si el usuario inició sesión, qué rol tiene (`admin`, `empleado`, `cliente`) y qué permisos posee sin pasar props manualmente por toda la jerarquía.
3. **`services/` (Axios):** Centraliza las peticiones HTTP al backend, inyectando automáticamente el token en los headers (`Authorization: Bearer <TOKEN>`).
4. **`ProtectedRoute.jsx`:** Evita que un usuario no autenticado o con rol no autorizado entre a rutas privadas (ej. un cliente intentando entrar a `/admin/reportes`).

---

## 🎯 4. Preguntas Frecuentes para la Evaluación

| Pregunta de Evaluación | Respuesta Clave |
|---|---|
| **¿Cómo se comunican el frontend y el backend?** | A través de una **API REST**. El frontend envía peticiones HTTP (GET, POST, PUT, DELETE) usando **Axios**, y el backend responde con datos en formato **JSON**. |
| **¿Qué es y para qué sirve JWT?** | Es un estándar para autenticación basado en tokens. Cuando el usuario se loguea, el backend genera un token firmado con su ID y rol. El frontend guarda este token (en `localStorage` o memoria) y lo envía en cada petición para comprobar quién es. |
| **¿Qué función cumple Mongoose?** | Es un ODM (Object Data Modeling) que define esquemas estrictos, validaciones y modelos para interactuar con MongoDB desde Node.js. |
| **¿Qué es un middleware en Express?** | Una función intermedia que se ejecuta entre la petición del cliente y la respuesta del controlador. Se usa para validaciones, verificar tokens (`authMiddleware`), o parsear datos (`express.json()`). |
| **¿Qué es y por qué se usa React Router?** | Permite crear navegación entre páginas en una SPA sin recargar el navegador, renderizando componentes según la URL. |
| **¿Para qué sirve el archivo `.env`?** | Para proteger información sensible (credenciales de BD, llaves secretas, puertos) y no subirlas al repositorio de código público. |

---

## 🚀 5. Comandos Rápidos de Ejecución

```bash
# Terminal 1 - Backend:
cd backend
npm run dev

# Terminal 2 - Frontend:
cd frontend
npm start
```
