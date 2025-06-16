const path = require('path');
const { readJSON, writeJSON } = require('../utils/fsUtils');
const cartsFile = path.join(__dirname, '../data/carritos.json');

const generateId = (carts) => {
  return carts.length ? Math.max(...carts.map(c => c.id)) + 1 : 1;
};

exports.createCart = async (req, res) => {
  const carts = await readJSON(cartsFile);
  const newCart = { id: generateId(carts), products: [] };
  carts.push(newCart);
  await writeJSON(cartsFile, carts);
  res.status(201).json(newCart);
};

exports.getCartById = async (req, res) => {
  const carts = await readJSON(cartsFile);
  const cart = carts.find(c => c.id == req.params.cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json(cart.products);
};

exports.addProductToCart = async (req, res) => {
  const carts = await readJSON(cartsFile);
  const cartIndex = carts.findIndex(c => c.id == req.params.cid);
  if (cartIndex === -1) return res.status(404).json({ error: 'Carrito no encontrado' });

  const pid = parseInt(req.params.pid);
  const existingProduct = carts[cartIndex].products.find(p => p.product === pid);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    carts[cartIndex].products.push({ product: pid, quantity: 1 });
  }

  await writeJSON(cartsFile, carts);
  res.json(carts[cartIndex]);
};