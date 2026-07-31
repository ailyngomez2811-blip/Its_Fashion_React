# Documentación del Backend: Its Fashion (React + MongoDB)

Este documento detalla la estructura y el funcionamiento de la API REST del backend desarrollada para la migración del sistema **Its Fashion**.

---

## 📂 Estructura de Directorios del Backend

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── cashRegisterController.js
│   ├── productController.js
│   ├── purchaseController.js
│   ├── reportController.js
│   ├── returnController.js
│   └── supplierController.js
├── middleware/
│   └── auth.js
├── models/
│   ├── Category.js
│   ├── CashRegister.js
│   ├── InventoryHistory.js
│   ├── Product.js
│   ├── Purchase.js
│   ├── Return.js
│   ├── Sale.js
│   ├── Supplier.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── cashRegisterRoutes.js
│   ├── productRoutes.js
│   ├── purchaseRoutes.js
│   ├── reportRoutes.js
│   ├── returnRoutes.js
│   └── supplierRoutes.js
├── .env
├── package.json
└── server.js
```

---

## 📄 Archivos Principales de Configuración

*   **`server.js`**: Punto de entrada de la aplicación. Enciende el servidor Node.js/Express, carga los middlewares globales (CORS, JSON Parser) y conecta las rutas de la API.
*   **`.env`**: Archivo de configuración que almacena las variables de entorno (Puerto, URI de conexión a MongoDB local y clave secreta de JWT).
*   **`package.json`**: Administra los scripts del backend (`start`, `dev` con nodemon) y las dependencias (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `dotenv`).

---

## 🗄️ 1. Configuración de Base de Datos (`config/`)

*   **`db.js`**: Configura la conexión a MongoDB utilizando la librería Mongoose ODM. Maneja reconexiones automáticas y reporta errores en la terminal si la base de datos local está apagada.

---

## 📐 2. Modelos de Mongoose (`models/`)

Definen la estructura de datos que se guarda en la base de datos MongoDB (equivalente a las tablas MySQL):

*   **`User.js`**: Registro de usuarios con roles (`Administrador`, `Empleado`, `Cliente`) y contraseñas seguras encriptadas automáticamente con `bcryptjs`.
*   **`Product.js`**: Esquema de productos (nombre, precios, stock, talla, color). Valida a nivel de base de datos que el precio de venta sea superior al precio de compra y que no se permitan valores negativos.
*   **`Category.js`**: Clasificación de productos (nombre y descripción).
*   **`Supplier.js`**: Ficha del proveedor con documento de identidad obligatorio y único.
*   **`Purchase.js`**: Historial de abastecimiento de mercancías. Embebe el detalle de la compra directamente dentro del documento.
*   **`Sale.js`**: Registra las ventas y embebe los ítems vendidos. Se asocia con el vendedor y el cliente.
*   **`Return.js`**: Solicitud de devoluciones de productos vinculadas a una venta.
*   **`CashRegister.js`**: Apertura/cierre de cajas físicas. Embebe el arreglo con todos los movimientos de dinero (Ingresos/Egresos) ocurridos durante el turno.
*   **`InventoryHistory.js`**: El historial de movimientos de inventario (Kardex) para auditorías detalladas del stock de productos.

---

## 🔒 3. Seguridad y Control de Accesos (`middleware/`)

*   **`auth.js`**: 
    *   **`protect`**: Middleware que extrae el token JWT de las cabeceras HTTP (`Authorization: Bearer <token>`), lo decodifica y añade los datos del usuario logueado al objeto de petición (`req.user`).
    *   **`authorize`**: Restringe el acceso a rutas específicas únicamente a roles aprobados (por ejemplo, permitiendo operaciones CRUD de productos y proveedores solo a administradores).

---

## 🧠 4. Controladores de Lógica de Negocio (`controllers/`)

Contienen las funciones que reciben las peticiones del frontend y ejecutan las reglas del negocio:

*   **`authController.js`**: Autenticación de sesiones, registro de nuevos usuarios y edición del perfil del usuario conectado.
*   **`productController.js`**: CRUD de productos. Al crear o modificar stock de forma manual, calcula la diferencia con el stock anterior y registra automáticamente un log de Entrada o Salida en el historial del inventario.
*   **`categoryController.js`**: Gestión de categorías. Evita que se elimine una categoría si existen productos actualmente asociados a ella.
*   **`supplierController.js`**: CRUD de proveedores con validación de documentos únicos.
*   **`saleController.js`**: Registra ventas. Verifica que haya stock disponible en cada ítem, descuenta la cantidad vendida, escribe el movimiento de inventario, y si hay una caja abierta, registra el ingreso del dinero directamente.
*   **`purchaseController.js`**: Registra compras incrementando el stock de forma correspondiente en el inventario.
*   **`returnController.js`**: Crea solicitudes de devolución con estado `Pendiente`. Al ser aprobada por un Administrador, devuelve el stock, ingresa el historial de inventario y descuenta el total de la caja activa como `Egreso`.
*   **`cashRegisterController.js`**: Apertura, cierre y movimientos de dinero manuales de caja. Valida que al cerrar, si hay diferencias físicas con el saldo teórico, se escriba obligatoriamente una justificación.
*   **`reportController.js`**: Agrupa y procesa estadísticas del negocio (ventas del día, tendencia mensual de ventas de los últimos 6 meses, top 5 de productos más vendidos, top 5 de clientes fieles y métodos de pago más usados) para las gráficas del panel administrativo.

---

## 🔗 5. Rutas API (`routes/`)

Enlazan los controladores a URLs accesibles por el cliente web:

*   `/api/auth` -> Registro, login, perfiles y listado de usuarios.
*   `/api/products` -> Operaciones del catálogo e historial de inventario.
*   `/api/categories` -> Altas, bajas y modificaciones de categorías.
*   `/api/suppliers` -> Directorio de proveedores.
*   `/api/sales` -> Creación y consulta de tickets de ventas.
*   `/api/purchases` -> Control de compras.
*   `/api/returns` -> Gestión del flujo de devoluciones.
*   `/api/cash-registers` -> Apertura, cierre y transacciones de caja.
*   `/api/reports` -> KPIs y analíticas para el panel principal.
