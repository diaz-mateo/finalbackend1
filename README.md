# 🛒 Backend de E-commerce

Este proyecto es una API RESTful desarrollada con Node.js, Express y MongoDB (a través de Mongoose). Permite la gestión de productos, carritos de compra, y la visualización de productos desde una interfaz basada en Handlebars.

---

## 🚀 Funcionalidades

### 🛍️ Productos

- CRUD completo para productos desde la API.
- Filtros por **categoría** y **disponibilidad**.
- Ordenamiento por **precio ascendente o descendente**.
- **Paginación** funcional.
- Vista con listado de productos desde Handlebars.

### 🛒 Carrito de Compras

- Crear carrito nuevo automáticamente.
- Agregar productos al carrito.
- Eliminar productos específicos o vaciar el carrito.
- Actualizar la cantidad de un producto o reemplazar todo el carrito.
- Vista del carrito con productos populados.

### 🛡️ Validaciones

- Control de errores con `try/catch`.
- Mensajes de error claros ante datos inválidos.
- El servidor no se cae ante errores críticos.

### 💾 Persistencia con MongoDB

- Implementación con Mongoose.
- Schemas bien definidos para `Product` y `Cart`.
- Populate automático de productos en los carritos.

---

👤 Autor
Mateo Díaz Paredes
Estudiante de Backend en Coderhouse.# finalbackend1
