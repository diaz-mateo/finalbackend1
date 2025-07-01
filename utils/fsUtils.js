const fs = require('fs').promises;
const path = require('path');

const productsPath = path.join(__dirname, '../data/productos.json');

// Leer productos
const getProducts = async () => {
  try {
    const data = await fs.readFile(productsPath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
};

// Guardar productos
const saveProducts = async (products) => {
  await fs.writeFile(productsPath, JSON.stringify(products, null, 2));
};

// Generar ID único (como string)
const generateId = async () => {
  const products = await getProducts();
  const ids = products.map(p => parseInt(p.id));
  const maxId = ids.length > 0 ? Math.max(...ids) : 0;
  return (maxId + 1).toString();
};

// Agregar producto
const addProduct = async (product) => {
  const products = await getProducts();
  const newProduct = {
    id: await generateId(),
    status: true,
    thumbnails: [],
    ...product,
  };
  products.push(newProduct);
  await saveProducts(products);
  return newProduct;
};

// Eliminar producto (compara como string)
const deleteProductById = async (id) => {
  const products = await getProducts();
  const index = products.findIndex(p => p.id === id.toString()); // <-- aseguramos que ID sea string
  if (index === -1) return false;

  products.splice(index, 1);
  await saveProducts(products);
  return true;
};

module.exports = {
  getProducts,
  saveProducts,
  addProduct,
  deleteProductById
};