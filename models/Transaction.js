const mongoose = require('mongoose')

const Transaction = new mongoose.Schema({
    username: {type: String, required: true},
    itemName: {type: String, required: true},
    closingPrice: {type: Number, required: true}, 
    buyer: {type: String, required: true},
},
{collection: 'transactions'}
)

module.exports = mongoose.model('Transaction', Transaction); 
