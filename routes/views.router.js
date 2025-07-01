const express = require('express');
const router = express.Router();
const { getProducts } = require('../controllers/products.controller'); // ✅ CORREGIDO

router.get('/', async (req, res) => {
  const products = await getProducts();
  res.render('home', { products });
});

router.get('/realtimeproducts', async (req, res) => {
  const products = await getProducts();
  res.render('realTimeProducts', { products });
});

module.exports = router;