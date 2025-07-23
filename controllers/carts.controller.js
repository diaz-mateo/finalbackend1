// Import dinámico del manager: FS o DB según USE_DB
const CartManager = process.env.USE_DB === 'true'
  ? require('../src/dao/managers/cartDBManager')
  : require('../src/dao/managers/cartFSManager');

/**
 * POST /api/carts
 * Crea un nuevo carrito vacío
 */
exports.createCart = async (req, res) => {
  try {
    const newCart = await CartManager.createCart();
    res.status(201).json({ status: 'success', payload: newCart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

/**
 * GET /api/carts/:cid
 * Lista los productos de un carrito (con populate en DB)
 */
exports.getCartById = async (req, res) => {
  try {
    const cart = await CartManager.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    }
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

/**
 * POST /api/carts/:cid/products/:pid
 * Agrega un producto al carrito (o incrementa cantidad)
 */
exports.addProductToCart = async (req, res) => {
  try {
    const cart = await CartManager.addProductToCart(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

/**
 * DELETE /api/carts/:cid/products/:pid
 * Elimina un producto del carrito
 */
exports.deleteCartProduct = async (req, res) => {
  try {
    const cart = await CartManager.deleteProduct(req.params.cid, req.params.pid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

/**
 * PUT /api/carts/:cid
 * Reemplaza el arreglo de productos del carrito
 * Body: { products: [{ product: pid, quantity }] }
 */
exports.updateCart = async (req, res) => {
  try {
    const cart = await CartManager.updateCart(req.params.cid, req.body.products);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

/**
 * PUT /api/carts/:cid/products/:pid
 * Actualiza la cantidad de un producto del carrito
 * - Si ?action=increase o ?action=decrease => modifica cantidad dinámicamente
 * - Si req.body.quantity está presente => lo establece directamente
 */
exports.updateQuantity = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const action = req.query.action;
    const quantity = req.body.quantity;

    let cart;

    if (action === 'increase') {
      cart = await CartManager.incrementQuantity(cid, pid);
    } else if (action === 'decrease') {
      cart = await CartManager.decreaseQuantity(cid, pid);
    } else if (quantity !== undefined) {
      cart = await CartManager.updateQuantity(cid, pid, quantity);
    } else {
      return res.status(400).json({ status: 'error', error: 'Debe proporcionar una acción o una cantidad' });
    }

    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
};

/**
 * DELETE /api/carts/:cid
 * Elimina todos los productos del carrito
 */
exports.clearCart = async (req, res) => {
  try {
    const cart = await CartManager.clearCart(req.params.cid);
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
};

/**
 * POST /api/carts/:cid/purchase
 * Finaliza la compra, genera un ticket y vacía el carrito
 */
exports.finalizePurchase = async (req, res) => {
  const { cid } = req.params;
  const purchaserEmail = req.body?.email || 'invitado@correo.com';

  try {
    const ticket = await CartManager.finalizePurchase(cid, purchaserEmail);
    res.status(200).json({ message: 'Compra finalizada', ticket });
  } catch (err) {
    console.error('❌ Error en finalizePurchase:', err.message);
    res.status(500).json({ error: `Error al finalizar la compra: ${err.message}` });
  }
};