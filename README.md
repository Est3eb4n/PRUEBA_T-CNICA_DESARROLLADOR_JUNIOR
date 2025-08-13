Sistema de Gestión de Ventas
Este proyecto es un sistema completo de gestión de ventas que incluye módulos para administrar vendedores, productos y ventas. Está construido con una arquitectura moderna que separa claramente las responsabilidades entre el frontend y el backend.

Características principales
Gestión de Vendedores: CRUD completo para vendedores con validación de datos

Gestión de Productos: CRUD completo para productos con control de stock

Registro de Ventas: Registro de ventas con actualización automática de stock

Relaciones: Ventas vinculadas a vendedores y productos

Validaciones: Completo sistema de validaciones en frontend y backend

Manejo de errores: Sistema unificado de manejo de errores con códigos específicos

Base de datos: SQLite con transacciones y relaciones

Tecnologías utilizadas
Backend
Node.js con Express

SQLite con sqlite3

Arquitectura MVC con separación clara de:

Rutas

Controladores

Servicios

Modelos

Frontend
HTML5 semántico

CSS3 (con Bootstrap para componentes UI)

JavaScript moderno (ES6+)

Fetch API para comunicación con el backend

Modularización con imports/exports

Estructura del proyecto
text
sales-system/
├── client/                  # Frontend
│   ├── css/
│   ├── js/
│   │   ├── api.js           # Cliente API
│   │   ├── products.js      # Lógica de productos
│   │   ├── sales.js         # Lógica de ventas
│   │   └── sellers.js       # Lógica de vendedores
│   └── index.html           # Página principal
│
├── server/                  # Backend
│   ├── config/
│   │   └── database.js      # Configuración de la base de datos
│   ├── controllers/         # Controladores
│   ├── models/              # Modelos de datos
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   ├── middlewares/         # Middlewares
│   └── populateDB.js        # Datos iniciales
│
└── README.md                # Este archivo
Instalación y configuración
Clonar el repositorio:

bash
git clone [url-del-repositorio]
cd sales-system
Instalar dependencias:

bash
npm install
Configurar la base de datos:

El sistema creará automáticamente la base de datos SQLite en server/data/sales-system.db

Puedes cargar datos iniciales ejecutando populateDB.js

Iniciar el servidor:

bash
npm start
Abrir el navegador en:

text
http://localhost:3000
Endpoints API
Vendedores
GET /api/sellers - Listar todos los vendedores

GET /api/sellers/:id - Obtener un vendedor específico

POST /api/sellers - Crear un nuevo vendedor

PUT /api/sellers/:id - Actualizar un vendedor

DELETE /api/sellers/:id - Eliminar un vendedor

Productos
GET /api/products - Listar todos los productos

GET /api/products/:id - Obtener un producto específico

POST /api/products - Crear un nuevo producto

PUT /api/products/:id - Actualizar un producto

DELETE /api/products/:id - Eliminar un producto

Ventas
GET /api/sales - Listar todas las ventas

GET /api/sales/:id - Obtener una venta específica

POST /api/sales - Registrar una nueva venta

GET /api/sales/seller/:seller_id - Ventas por vendedor

GET /api/sales/product/:product_id - Ventas por producto

Consideraciones de diseño
Validaciones:

Validaciones tanto en frontend como en backend

Mensajes de error claros y específicos

Códigos de error estandarizados

Manejo de errores:

Middleware centralizado de manejo de errores

Logging detallado de errores

Respuestas consistentes en formato JSON

Base de datos:

Transacciones para operaciones críticas (como ventas)

Claves foráneas y restricciones de integridad

Triggers para actualización automática de timestamps

Frontend:

Interfaz modularizada por componentes

Manejo de estados de carga y error

Feedback visual para el usuario

Mejoras futuras
Autenticación y autorización

Reportes y estadísticas

Búsqueda y filtrado avanzado

Exportación de datos

Pruebas unitarias y de integración

### Diagrama SQL

<img width="6624" height="2947" alt="image" src="https://github.com/user-attachments/assets/119b6c27-a250-4639-82c7-b10a3fc94aa0" />
