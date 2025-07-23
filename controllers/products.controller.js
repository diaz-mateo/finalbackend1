const ProductManager = require('../src/dao/managers/productDBManager');

// Constantes para paginación
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

// Obtener todos los productos con paginación, filtros y links
const getAllProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const { sort, query } = req.query;

    const result = await ProductManager.getProducts({ limit, page, sort, query });

    // Construcción de prevLink y nextLink
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const prevLink = result.hasPrevPage ? `${baseUrl}?page=${result.prevPage}&limit=${limit}` : null;
    const nextLink = result.hasNextPage ? `${baseUrl}?page=${result.nextPage}&limit=${limit}` : null;

    res.status(200).json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      prevLink,
      nextLink
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await ProductManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: product });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Agregar un nuevo producto
const addProduct = async (req, res) => {
  try {
    const { title, description, price, code, stock, category, status } = req.body;

    // Validación de campos obligatorios
    if (!title || !description || price == null || !code || stock == null || !category) {
      return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (isNaN(numericPrice) || numericPrice < 0 || isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ status: 'error', message: '❌ El precio y el stock no pueden ser negativos' });
    }

    const newProduct = await ProductManager.addProduct({
      title,
      description,
      price: numericPrice,
      code,
      stock: numericStock,
      category,
      status: status === 'on' || status === true || status === 'true'
    });

    res.redirect('/products');
  } catch (error) {
    const friendlyMessage =
      error?.errors?.price?.message ||
      error?.errors?.stock?.message ||
      error.message;

    res.status(400).json({ status: 'error', message: friendlyMessage });
  }
};

// Actualizar un producto existente
const updateProduct = async (req, res) => {
  try {
    const { price, stock } = req.body;

    // Validación para evitar valores negativos
    if ((price !== undefined && Number(price) < 0) || (stock !== undefined && Number(stock) < 0)) {
      return res.status(400).json({ status: 'error', message: '❌ El precio y el stock no pueden ser negativos' });
    }

    const updatedProduct = await ProductManager.updateProduct(req.params.pid, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.status(200).json({ status: 'success', payload: updatedProduct });
  } catch (error) {
    const friendlyMessage =
      error?.errors?.price?.message ||
      error?.errors?.stock?.message ||
      error.message;

    res.status(400).json({ status: 'error', message: friendlyMessage });
  }
};

// Eliminar un producto por ID
const deleteProduct = async (req, res) => {
  try {
    const deleted = await ProductManager.deleteProduct(req.params.pid);
    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', message: '✅ Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
};