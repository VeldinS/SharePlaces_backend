const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const getCoordsForAddress = require('../util/location');
//const randomId = require('./randomIdGenerator'); //IF WORKING WITH DUMMY DATA AND NOT REAL DATABASE
const Place = require('../models/place')
const User = require('../models/user')
const HttpError = require("../models/http-error");


////////////////////////////////////////////////////////////
//SEARCHING PLACES BY THEIR UNIQUE PLACE ID
const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid; // to get pid: 'p1'
    let place;
    try {
        place = await Place.findById(placeId);
    }catch (err){
        const error = new HttpError('Something went wrong, could not find a place.', 500);
        return next(error);
    }
    //IF PLACE IS NOT FOUND
    if(!place) {
        const error = new HttpError('Could not find a place for the provided id.', 404);
        return next(error);
    }
    res.json({ place: place.toObject({getters: true}) });
};

//////////////////////////////////////////////////////////
//SEARCHING FOR ALL PLACES FOR SOME UNIQUE USER ID
const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid; //to get uid: 'u1'
    let places;
    try{
        places = await Place.find({creator: userId});
    }catch(err){
        const error = new HttpError('Fetching places failed, please try again. ', 500);
        return next(error);
    }
    //IF NO PLACES ARE FOUND FOR PROVIDED ID
    if(!places || places.length === 0){
        const error = new HttpError('Could not find a places for the provided id.', 404);
        return next(error);
    }
    res.json({place: places.map(place => place.toObject({getters: true})) })
}

////////////////////////////////////////////////////////
//CREATING NEW PLACE
const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
       return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }
    const { title, description, address, creator } = req.body;
    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    }catch (error){
        return next(error);
    }
    //NEW PLACE
    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://marvel-b1-cdn.bc0a.com/f00000000179470/www.esbnyc.com/sites/default/files/styles/small_feature/public/2019-10/home_banner-min.jpg?itok=uZt-03Vw',
        creator
    });
    //CHECKING IF DESIRED USER ID EXISTS SO THE PROPER ERROR CAN BE PROMPTED
    let user;
    try{
        user = await User.findById(creator)
    }catch(err){
        const error = new HttpError('Creating place failed, please try again. ', 500);
        return next(error);
    }
    if(!user){
        const error = new HttpError('Could not find user for provided ID.',404);
        return next(error);
    }
    //SAVING OUR CREATED PLACE TO DATABASE
    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({session: sess});
        user.places.push(createdPlace);
        await user.save({session: sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('Creating place failed, please try again.', 500);
        return next(error);
    }
    res.status(201).json({place:createdPlace}) //RETURNING RESPONSE
};

////////////////////////////////////////////////////////////
//UPDATING EXISTING PLACE
const updatePlace = async (req, res, next) => {
    const errors = validationResult(req); //CHECKING FOR VALIDATION
    if(!errors.isEmpty()){
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        )
    }
    //CHANGING THE DATA OF PLACE
    const { title, description } = req.body;
    const placeId = req.params.pid;
    let place;
    try{
        place = await Place.findById(placeId); //FINDING DESIRED PLACE
    }catch (err){
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }
    place.title = title;      //ACTUAL UPDATES
    place.description = description;
    //UPDATING OUR PLACE WITH NEW INFORMATION IN DATABASE
    try{
        await place.save();
    }catch (err){
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }
    res.status(200).json({ place:  place.toObject({getters: true}) })
};

////////////////////////////////////////////////////////////
//DELETING PLACE
const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;    //GETTING ID OF DESIRED PLACE TO DELETE
    let place;
    try{
        place = await Place.findById(placeId).populate('creator');
    }catch (err){
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }

    if(!place){
        const error = new HttpError('Could not find a place for this ID.', 404);
        return next(error);
    }

    //DELETING OUR PLACE FROM DATABASE
    try{
        const sess = await mongoose.startSession();
        sess.startTransaction();
        place.remove({session: sess});
        place.creator.places.pull(place);
        await place.creator.save({session: sess});
        await sess.commitTransaction();
    }catch(err){
        const error = new HttpError('Something went wrong, could not delete place.', 500);
        return next(error);
    }
    res.status(200).json({message: 'Deleted place.'})
}

////////////////////////////////////////////////////////////
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;