const TicketModel = require('../models/ticketModel');
const { v4: uuidv4 } = require('uuid');

class TicketManager {
  async createTicket({ amount, purchaser, products }) {
    const code = uuidv4();
    const newTicket = await TicketModel.create({
      code,
      amount,
      purchaser,
      products, // ✅ Agregado aquí
    });
    return newTicket;
  }

  async getAllTickets() {
    return await TicketModel.find();
  }

  async getTicketById(id) {
    return await TicketModel.findById(id);
  }
}

module.exports = new TicketManager();