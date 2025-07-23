// app.js
require('dotenv').config(); // Carga variables de entorno desde .env

const express = require('express');
const path = require('path');
const http = require('http');
const session = require('express-session'); // ✅ Importar express-session
const exphbs = require('express-handlebars');
const connectDB = require('./db'); // Conexión a MongoDB

// Routers
const productsRouter = require('./routes/products.router');
const cartsRouter    = require('./routes/carts.router');
const viewsRouter    = require('./routes/views.router');

const app  = express();
const PORT = process.env.PORT || 8080;

// Conectar a la base de datos
connectDB();

// Crear servidor HTTP (necesario para socket.io)
const server = http.createServer(app);

// ✅ Configurar express-session
app.use(session({
  secret: 'mi_clave_secreta_super_segura', // cambia esto por algo más seguro en producción
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Configuración de Handlebars con helpers
const hbs = exphbs.create({
  helpers: {
    multiply: (a, b) => a * b,
    calculateTotal: (products) => {
      if (!products) return 0;
      return products.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts',    cartsRouter);
app.use('/',              viewsRouter);

// Ruta 404 — corregida para Express v5
app.use(/(.*)/, (req, res) => {
  res.status(404).render('notFound', { url: req.originalUrl });
});

// WebSockets
require('./websocket')(server);

// Arrancar el servidor
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});