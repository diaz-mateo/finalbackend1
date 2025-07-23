const productService = require('../dao/dbManagers/productDBManager');

const getProductsView = async (req, res) => {
  try {
    // Obtener query params
    const { limit = 10, page = 1, sort, query } = req.query;

    // Obtener el cartId desde el usuario autenticado o desde sesión
    const cartId = req.user?.cart?._id?.toString() || req.session?.cartId;

    // Lógica para obtener productos con filtros, paginación y orden
    const result = await productService.getProducts(limit, page, sort, query);

    res.render('products', {
      products: result.payload,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      totalPages: result.totalPages,
      cartId,
      title: 'Productos disponibles'
    });
  } catch (error) {
    console.error('Error al cargar productos:', error.message);
    res.status(500).send('Error al cargar la vista de productos');
  }
};

module.exports = {
  getProductsView
};