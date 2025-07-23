// models/ticket.model.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: Number
    }
  ],
  amount: Number,
  purchaser: {
    type: String, // o ObjectId si lo enlazas a un usuario
    required: true
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);