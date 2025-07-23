// src/dao/models/cartModel.js
const { Schema, model, Types } = require('mongoose');

const cartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: 'Product',
          required: [true, 'El producto es obligatorio']
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'La cantidad mínima es 1'],
          default: 1
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Índice para mejorar consultas por producto en carritos
cartSchema.index({ 'products.product': 1 });

module.exports = model('Cart', cartSchema);