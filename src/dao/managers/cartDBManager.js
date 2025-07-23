const Cart = require('../models/cartModel');
const ticketManager = require('./ticketDBManager'); // ⬅️ Usa el ticketManager
const { v4: uuidv4 } = require('uuid');

module.exports = {
  // Obtener carrito por ID con productos poblados
  getCartById: async (cid) => {
    try {
      const cart = await Cart.findById(cid).populate('products.product').lean();
      if (!cart) throw new Error('Carrito no encontrado');
      return cart;
    } catch (error) {
      throw new Error(`Error al obtener el carrito: ${error.message}`);
    }
  },

  // Crear un nuevo carrito
  createCart: async () => {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`);
    }
  },

  // Agregar un producto al carrito (aumentar cantidad si ya existe)
  addProductToCart: async (cid, pid) => {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) throw new Error('Carrito no encontrado');

      const item = cart.products.find(i => i.product.equals(pid));
      if (item) {
        item.quantity++;
      } else {
        cart.products.push({ product: pid, quantity: 1 });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  },

  // Eliminar un producto del carrito
  deleteProduct: async (cid, pid) => {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) throw new Error('Carrito no encontrado');

      cart.products = cart.products.filter(i => !i.product.equals(pid));
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
    }
  },

  // Reemplazar todos los productos del carrito
  updateCart: async (cid, products) => {
    try {
      const updated = await Cart.findByIdAndUpdate(
        cid,
        { products },
        { new: true }
      ).lean();
      if (!updated) throw new Error('Carrito no encontrado');
      return updated;
    } catch (error) {
      throw new Error(`Error al actualizar el carrito: ${error.message}`);
    }
  },

  // Actualizar cantidad de un producto específico
  updateQuantity: async (cid, pid, qty) => {
    try {
      const cart = await Cart.findById(cid);
      if (!cart) throw new Error('Carrito no encontrado');

      const itemIndex = cart.products.findIndex(i => i.product.equals(pid));
      if (itemIndex === -1) throw new Error('Producto no encontrado en el carrito');

      if (qty <= 0) {
        cart.products.splice(itemIndex, 1);
      } else {
        cart.products[itemIndex].quantity = qty;
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error(`Error al actualizar cantidad: ${error.message}`);
    }
  },

  // Vaciar completamente el carrito
  clearCart: async (cid) => {
    try {
      const cleared = await Cart.findByIdAndUpdate(
        cid,
        { products: [] },
        { new: true }
      ).lean();
      if (!cleared) throw new Error('Carrito no encontrado');
      return cleared;
    } catch (error) {
      throw new Error(`Error al vaciar el carrito: ${error.message}`);
    }
  },

  // ✅ Finalizar compra y generar ticket
  finalizePurchase: async (cid, purchaserEmail = 'invitado@correo.com') => {
    try {
      const cart = await Cart.findById(cid).populate('products.product');
      if (!cart) throw new Error('Carrito no encontrado');

      if (cart.products.length === 0) {
        throw new Error('El carrito está vacío, no se puede procesar la compra.');
      }

      const products = cart.products.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      }));

      const amount = cart.products.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      // ✅ Usa ticketManager y guarda productos también
      const ticket = await ticketManager.createTicket({
        code: uuidv4(),
        purchaser: purchaserEmail,
        amount,
        products
      });

      // Vaciar carrito tras la compra
      cart.products = [];
      await cart.save();

      // Devolver ticket con productos poblados
      const populatedTicket = await ticket.populate('products.product');
      return populatedTicket;
    } catch (error) {
      throw new Error(`Error al finalizar la compra: ${error.message}`);
    }
  }
};