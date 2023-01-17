const mongoose = require('mongoose');
const { validationResult } = require('express-validator')

const randomId = require('./randomIdGenerator');
const User = require('../models/user')
const HttpError = require('../models/http-error')


////////////////////////////////////////////////////////////
//RETURNING FULL LIST OF USERS
const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    }catch(err){
        const error = new HttpError('Fetching users failed, please try again later.', 500);
        return next(error);
    }
    res.json({users: users.map(user => user.toObject({getters: true}))})
}

////////////////////////////////////////////////////////////
//SIGNUP
const signup = async (req, res, next) => {
    //CHECKING FOR EMAIL VALIDATION FROM MONGOOSH VALIDATOR
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(
            new HttpError('Invalid inputs passed, please check your data', 422)
        )
    }
    const {name, email, password} = req.body; //GETTING DATA FROM THE BODY
    //AFTER GETTING DATA, CHECKING IF USER WITH THAT EMAIL ALREADY EXISTS
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    }catch (err){
        const error = new HttpError('Signing up failed, please try again later.', 500);
        return next(error);
    }
    //RETURNING ERROR IF EXISTING USER IS FOUND
    if(existingUser){
        const error = new HttpError('User exist already, please login instead.', 422);
        return next(error);
    }
    //IF EMAIL IS UNIQUE, THEN CREAING NEW USER
    const createdUser = new User({
        name,
        email,
        image: 'https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg',
        password,
        places: []
    });
    //SENDING NEW USER DATA TO DATABASE
    try {
        await createdUser.save();
    }catch(err){
        const error = new HttpError('Signing up failed, please try again.', 500);
        return next(error);
    }
    //JSON RESPONSE
    res.status(201).json({ user: createdUser.toObject({getters: true}) });
}

////////////////////////////////////////////////////////////
//LOGIN
const login = async (req, res, next) => {
    const { email, password} = req.body; //GETTING DATA FROM BODY
    let existingUser;
    try {
        existingUser = await User.findOne({email: email});
    }catch (err){
        const error = new HttpError('Login failed, please try again later.', 500);
        return next(error);
    }
    if(!existingUser || existingUser.password !== password){
        const error = new HttpError('Invalid credientials, could not log you in.', 401);
        return next(error);
    }
    res.json({message: 'Logged in!',user:  existingUser.toObject({getters: true})});
}

////////////////////////////////////////////////////////////
exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;