// src/dao/models/productModel.js
const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'El código es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true
    },
    price: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      min: [0, 'El precio no puede ser negativo']
    },
    status: {
      type: Boolean,
      default: true
    },
    stock: {
      type: Number,
      required: [true, 'El stock es obligatorio'],
      min: [0, 'El stock no puede ser negativo']
    },
    category: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      trim: true
    },
  },
  {
    timestamps: true
  }
);

productSchema.plugin(mongoosePaginate);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = model('Product', productSchema);