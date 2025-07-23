// src/dao/managers/productDBManager.js
const Product = require('../models/productModel');

module.exports = {
  // ✅ Obtener productos con paginación, filtros y orden
  getProductsPaginated: (params = {}) => {
    const {
      page = 1,
      limit = 10,
      sort = null,
      query = null
    } = params;

    const filter = query
      ? {
          $or: [
            { category: { $regex: query, $options: 'i' } },
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ]
        }
      : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort ? { price: sort === 'asc' ? 1 : -1 } : {},
      lean: true,
    };

    return Product.paginate(filter, options);
  },

  // ✅ Obtener producto por ID
  getProductById: (id) => Product.findById(id).lean(),

  // ✅ Agregar nuevo producto
  addProduct: async (data) => {
    if (data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    if (data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    return Product.create(data);
  },

  // ✅ Actualizar producto por ID
  updateProduct: async (id, data) => {
    if (data.price !== undefined && data.price < 0) {
      throw new Error('El precio no puede ser negativo');
    }
    if (data.stock !== undefined && data.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }

    return Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
  },

  // ✅ Eliminar producto por ID
  deleteProduct: (id) => Product.findByIdAndDelete(id).lean(),
};