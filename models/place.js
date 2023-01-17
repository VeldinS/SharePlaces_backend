const mongoose = require('mongoose');


//CREATING SCHEMA FOR DATABASE THAT WILL BE CALLED IN CONTROLLERS
const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    address: {type: String, required: true},
    location: {
        lat: {type: Number, required: true},
        lng: {type: Number, required: true},
    },
    creator: {type: mongoose.Types.ObjectId, required:true, ref: 'User'} //ONE USER CAN HAVE MULTIPLE PLACES, BUT PLACE HAS ONLY ONE USER
});

module.exports = mongoose.model('Place', placeSchema);