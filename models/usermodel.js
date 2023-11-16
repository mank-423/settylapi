const mongoose = require('mongoose')

const User = new mongoose.Schema({
    name: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true}, 
    password: {type: String, required: true},
},
{collection: 'user-data'}
)

module.exports = mongoose.model('UserData', User); 
