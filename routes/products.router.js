const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/products.controller');

router.get('/', getAllProducts);
router.get('/:pid', getProductById);
router.post('/', addProduct);
router.put('/:pid', updateProduct);
router.delete('/:pid', deleteProduct);

module.exports = router;