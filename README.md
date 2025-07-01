# 🛒 E-commerce

## 🚀 Funcionalidades principales

- 🧩 Configuración del motor de plantillas **Handlebars**.
- 🔌 Integración de **WebSockets** con `socket.io`.
- 📄 Vista principal `/` (`home.handlebars`) con listado estático de productos.
- 🔁 Vista dinámica `/realtimeproducts` (`realTimeProducts.handlebars`) que:
  - Muestra productos en tiempo real.
  - Permite agregar nuevos productos mediante WebSocket.
  - Permite eliminar productos por su ID.
  - Actualiza automáticamente la lista en todos los clientes conectados.

---

## 🛠️ Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [Express Handlebars](https://www.npmjs.com/package/express-handlebars)
- [nodemon](https://www.npmjs.com/package/nodemon)# backendpreen2
