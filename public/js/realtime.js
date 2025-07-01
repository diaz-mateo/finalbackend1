const socket = io();

const productList = document.getElementById('productList');
const addForm = document.getElementById('addForm');
const deleteForm = document.getElementById('deleteForm');

// Escuchar evento de productos actualizados desde el servidor
socket.on('productList', products => {
  productList.innerHTML = '';

  products.forEach(prod => {
    const li = document.createElement('li');
    li.style.marginBottom = '10px';
    li.style.borderBottom = '1px solid #ccc';
    li.style.paddingBottom = '10px';
    li.setAttribute('data-id', prod.id);

    li.innerHTML = `
      <strong>${prod.title}</strong> - $${prod.price}<br>
      🆔 ID: <code>${prod.id}</code>
      <button class="deleteBtn" data-id="${prod.id}">❌ Eliminar</button>
    `;

    productList.appendChild(li);
  });

  // Botones de eliminar individuales
  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      socket.emit('deleteProduct', id);
    });
  });
});

// Agregar producto desde formulario
addForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(addForm);
  const product = Object.fromEntries(formData.entries());
  product.price = parseFloat(product.price);
  product.stock = parseInt(product.stock);
  socket.emit('newProduct', product);
  addForm.reset();
});

// Eliminar producto manualmente por ID desde formulario
deleteForm.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(deleteForm);
  const id = formData.get('id');
  socket.emit('deleteProduct', id);
  deleteForm.reset();
});

// Eliminar producto con botón individual
productList.addEventListener('click', (e) => {
  if (e.target.classList.contains('deleteBtn')) {
    const id = e.target.getAttribute('data-id');
    socket.emit('deleteProduct', id);
  }
});