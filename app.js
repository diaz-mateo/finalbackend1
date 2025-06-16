// app.js
const express = require('express');
const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());

// Rutas
const productsRouter = require('./routes/products.router');
const cartsRouter = require('./routes/carts.router');

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});