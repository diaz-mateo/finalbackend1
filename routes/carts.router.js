// routes/carts.router.js

const express = require('express');
const router = express.Router();
const {
  createCart,
  getCartById,
  addProductToCart,
  deleteCartProduct,
  updateCart,
  updateQuantity,
  clearCart,
  finalizePurchase // ✅ Nueva función agregada
} = require('../controllers/carts.controller');

// Crear nuevo carrito
router.post('/', createCart);

// Obtener carrito por ID
router.get('/:cid', getCartById);

// Agregar producto al carrito
router.post('/:cid/product/:pid', addProductToCart);

// Eliminar un producto del carrito
router.delete('/:cid/product/:pid', deleteCartProduct);

// Reemplazar todo el arreglo de productos del carrito
router.put('/:cid', updateCart);

// Actualizar cantidad de un producto (aumentar o disminuir)
router.put('/:cid/product/:pid', updateQuantity);

// Vaciar el carrito
router.delete('/:cid', clearCart);

// ✅ Finalizar compra y generar ticket
router.post('/:cid/purchase', finalizePurchase);

module.exports = router;