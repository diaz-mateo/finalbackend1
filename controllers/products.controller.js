const path = require('path');
const { readJSON, writeJSON } = require('../utils/fsUtils');
const filePath = path.join(__dirname, '../data/productos.json');

const generateId = (products) => {
  return products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
};

exports.getAllProducts = async (req, res) => {
  const products = await readJSON(filePath);
  const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
  res.json(products.slice(0, limit));
};

exports.getProductById = async (req, res) => {
  const products = await readJSON(filePath);
  const product = products.find(p => p.id == req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
};

exports.addProduct = async (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;
  if (!title || !description || !code || price == null || stock == null || !category)
    return res.status(400).json({ error: 'Campos obligatorios faltantes' });

  const products = await readJSON(filePath);
  const newProduct = {
    id: generateId(products),
    title,
    description,
    code,
    price,
    status,
    stock,
    category,
    thumbnails
  };

  products.push(newProduct);
  await writeJSON(filePath, products);
  res.status(201).json(newProduct);
};

exports.updateProduct = async (req, res) => {
  const products = await readJSON(filePath);
  const index = products.findIndex(p => p.id == req.params.pid);
  if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
  products[index] = updatedProduct;
  await writeJSON(filePath, products);
  res.json(updatedProduct);
};

exports.deleteProduct = async (req, res) => {
  let products = await readJSON(filePath);
  const exists = products.find(p => p.id == req.params.pid);
  if (!exists) return res.status(404).json({ error: 'Producto no encontrado' });

  products = products.filter(p => p.id != req.params.pid);
  await writeJSON(filePath, products);
  res.json({ message: 'Producto eliminado' });
};