const path = require('path');
const {
  getProducts,
  saveProducts,
  addProduct,
  deleteProductById
} = require('../utils/fsUtils');

const productsPath = path.join(__dirname, '../data/productos.json');

// 🔹 Para WebSocket
const addProductRaw = async (productData) => {
  const { title, description, code, price, stock, category, thumbnails, status } = productData;

  if (!title || !description || !code || !price || !stock || !category) {
    throw new Error('Faltan campos obligatorios');
  }

  const products = await getProducts();
  const newId = (Math.max(0, ...products.map(p => parseInt(p.id))) + 1).toString();

  const newProduct = {
    id: newId,
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
    status: status !== undefined ? status : true
  };

  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

// 🔹 API HTTP: GET /api/products
const getAllProducts = async (req, res) => {
  try {
    const products = await getProducts();
    const limit = req.query.limit;
    if (limit) {
      return res.json(products.slice(0, parseInt(limit)));
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// 🔹 API HTTP: GET /api/products/:pid
const getProductById = async (req, res) => {
  try {
    const { pid } = req.params;
    const products = await getProducts();
    const product = products.find(p => p.id == pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar producto' });
  }
};

// 🔹 API HTTP: POST /api/products
const addProductHandler = async (req, res) => {
  try {
    const newProduct = await addProduct(req.body);
    res.status(201).json({ message: 'Producto agregado', product: newProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 🔹 API HTTP: PUT /api/products/:pid
const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const updateData = req.body;

    if (updateData.id) {
      return res.status(400).json({ error: 'No se puede modificar el ID del producto' });
    }

    const products = await getProducts();
    const index = products.findIndex(p => p.id == pid);
    if (index === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    products[index] = { ...products[index], ...updateData };
    await saveProducts(products);

    res.json({ message: 'Producto actualizado', product: products[index] });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

// 🔹 API HTTP: DELETE /api/products/:pid
const deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;
    const success = await deleteProductById(pid);
    if (!success) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

module.exports = {
  // HTTP API
  getAllProducts,
  getProductById,
  addProduct: addProductHandler,
  updateProduct,
  deleteProduct,
  // Vistas
  getProducts,
  // WebSocket
  addProductRaw,
  deleteProductById
};