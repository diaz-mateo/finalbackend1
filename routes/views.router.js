const express = require('express');
const router = express.Router();
const ProductManager = require('../src/dao/managers/productDBManager');
const CartManager = require('../src/dao/managers/cartDBManager');
const TicketModel = require('../src/dao/models/ticketModel');

// ✅ Middleware para asignar o crear un carrito al usuario
router.use(async (req, res, next) => {
  try {
    if (!req.session) {
      req.session = {};
    }

    if (!req.session.cartId) {
      const newCart = await CartManager.createCart();
      req.session.cartId = newCart._id.toString();
    }

    res.locals.cartId = req.session.cartId;
    next();
  } catch (error) {
    console.error('Error en el middleware de sesión/cart:', error);
    res.status(500).send('Error interno en el manejo de sesión/cart');
  }
});

// ✅ Redirige a /products
router.get('/', (req, res) => {
  res.redirect('/products');
});

// ✅ Formulario para agregar nuevo producto (DEBE estar antes de /products/:pid)
router.get('/products/new', (req, res) => {
  res.render('newProductForm');
});

// ✅ Ruta POST para agregar un producto desde el formulario
router.post('/products/new', async (req, res) => {
  try {
    const { title, description, price, code, stock, category } = req.body;
    const status = req.body.status === 'on';

    await ProductManager.addProduct({
      title,
      description,
      price,
      code,
      stock,
      category,
      status
    });

    res.redirect('/products');
  } catch (error) {
    console.error('Error al agregar producto:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// ✅ Formulario para editar producto
router.get('/products/edit/:pid', async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('editProductForm', { product });
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

// ✅ Ruta POST para guardar cambios del formulario de edición
router.post('/products/edit/:pid', async (req, res) => {
  try {
    const updatedFields = req.body;
    updatedFields.status = req.body.status === 'on';
    await ProductManager.updateProduct(req.params.pid, updatedFields);
    res.redirect('/products');
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).send('Error al actualizar el producto');
  }
});

// ✅ Listado de productos con paginación, filtros y botones de edición
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, category } = req.query;

    const result = await ProductManager.getProductsPaginated({ page, limit, sort, category });

    const products = result.docs.map(p => ({
      ...p,
      id: p._id.toString()
    }));

    res.render('products', {
      products,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/products?page=${result.prevPage}&limit=${limit}` : null,
      nextLink: result.hasNextPage ? `/products?page=${result.nextPage}&limit=${limit}` : null,
      cartId: res.locals.cartId,
    });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener los productos');
  }
});

// ✅ Vista de producto individual
router.get('/products/:pid', async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.pid);
    if (!product) return res.status(404).send('Producto no encontrado');

    res.render('product', {
      product,
      cartId: res.locals.cartId,
    });
  } catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).send('Error al obtener el producto');
  }
});

// ✅ Vista de carrito
router.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await CartManager.getCartById(req.params.cid);
    if (!cart) return res.status(404).send('Carrito no encontrado');

    const formattedProducts = cart.products.map(item => ({
      ...item,
      product: {
        ...item.product,
        _id: item.product._id.toString()
      }
    }));

    res.render('cart', { cart: { ...cart, products: formattedProducts } });
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).send('Error al obtener el carrito');
  }
});

// ✅ Vista de productos en tiempo real (CORREGIDO)
router.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await ProductManager.getProductsPaginated({ limit: 100 });
    const products = result.docs.map(p => ({
      ...p,
      id: p._id.toString()
    }));

    res.render('realTimeProducts', { products });
  } catch (error) {
    console.error('Error al obtener productos en tiempo real:', error);
    res.status(500).send('Error al obtener productos en tiempo real');
  }
});

// ✅ Vista de ticket después de compra
router.get('/ticket/:tid', async (req, res) => {
  try {
    const ticket = await TicketModel.findById(req.params.tid).populate('products.product');
    if (!ticket) return res.status(404).send('Ticket no encontrado');

    const formattedTicket = {
      ...ticket.toObject(),
      products: ticket.products.map(item => ({
        title: item.product.title,
        quantity: item.quantity,
        price: item.product.price,
        total: item.quantity * item.product.price
      }))
    };

    res.render('ticket', { ticket: formattedTicket });
  } catch (error) {
    console.error('Error al obtener el ticket:', error);
    res.status(500).send('Error al obtener el ticket');
  }
});

// ✅ Ruta para finalizar compra y redirigir al ticket
router.post('/purchase', async (req, res) => {
  try {
    const cartId = req.session.cartId;
    const purchaser = 'usuario@example.com'; // 🔁 Puedes reemplazarlo con el usuario real si usas auth

    const result = await CartManager.finalizePurchase(cartId, purchaser);

    // Vaciar carrito de sesión o regenerar uno nuevo
    const newCart = await CartManager.createCart();
    req.session.cartId = newCart._id.toString();

    // Redirigir al ticket
    res.redirect(`/ticket/${result.ticket._id}`);
  } catch (error) {
    console.error('❌ Error en finalizePurchase:', error);
    res.status(500).send('Error al finalizar la compra');
  }
});

module.exports = router;