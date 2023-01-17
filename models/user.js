const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')


//CREATING SCHEMA FOR DATABASE THAT WILL BE CALLED IN CONTROLLERS
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true, minLength: 6},
    image: {type: String, required: true},
    places: [{type: mongoose.Types.ObjectId, required:true, ref: 'Place'}] //ONE USER CAN HAVE MULTIPLE PLACES, BUT PLACE HAS ONLY ONE USER
});

userSchema.plugin(uniqueValidator); //VALIDATOR FOR EMAILS (TO CHECK IF THEY ARE ALREADY USED)

module.exports = mongoose.model('User', userSchema);