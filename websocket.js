// websocket.js

const ProductManager = require('./src/dao/managers/productDBManager');
const { Server } = require('socket.io');

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', async (socket) => {
    console.log('🟢 Cliente conectado por websocket');

    try {
      // Enviar lista inicial de productos al conectar
      const products = await ProductManager.getProducts({ page: 1, limit: 20 });
      socket.emit('productList', products);
    } catch (err) {
      console.error('❌ Error al cargar productos iniciales:', err.message);
      socket.emit('loadError', 'No se pudo cargar la lista de productos');
    }

    // Escuchar evento de nuevo producto
    socket.on('newProduct', async (data) => {
      try {
        await ProductManager.addProduct(data);
        const updated = await ProductManager.getProducts({ page: 1, limit: 20 });
        io.emit('productList', updated);
      } catch (err) {
        console.error('❌ Error al agregar producto vía WebSocket:', err.message);
        socket.emit('addError', err.message);
      }
    });

    // Escuchar evento de eliminar producto
    socket.on('deleteProduct', async (id) => {
      try {
        const deleted = await ProductManager.deleteProductById(id);
        if (!deleted) {
          socket.emit('deleteError', `Producto con ID ${id} no encontrado`);
          return;
        }
        const updated = await ProductManager.getProducts({ page: 1, limit: 20 });
        io.emit('productList', updated);
      } catch (err) {
        console.error('❌ Error al eliminar producto vía WebSocket:', err.message);
        socket.emit('deleteError', err.message);
      }
    });
  });
};