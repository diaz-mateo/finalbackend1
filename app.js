const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const exphbs = require('express-handlebars');

// Routers
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');
const viewsRouter = require('./routes/views.router');

// Controladores para WebSocket
const {
  getProducts,
  addProductRaw,
  deleteProductById
} = require('./controllers/products.controller');

// Configuración
const PORT = 8080;
const server = http.createServer(app);
const io = new Server(server);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// WebSocket
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado por websocket');

  // Enviar lista inicial
  getProducts().then(products => {
    socket.emit('productList', products);
  });

  // Agregar producto
  socket.on('newProduct', async (product) => {
    try {
      await addProductRaw(product);
      const updatedProducts = await getProducts();
      io.emit('productList', updatedProducts);
    } catch (error) {
      console.error('❌ Error al agregar producto:', error.message);
      socket.emit('addError', 'Error al agregar producto.');
    }
  });

  // Eliminar producto
  socket.on('deleteProduct', async (id) => {
    try {
      const success = await deleteProductById(id);
      if (!success) {
        console.warn(`⚠️ Producto con ID ${id} no encontrado.`);
        socket.emit('deleteError', `Producto con ID ${id} no encontrado.`);
        return;
      }

      const updatedProducts = await getProducts();
      io.emit('productList', updatedProducts);
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error.message);
      socket.emit('deleteError', 'Error interno al eliminar producto.');
    }
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});