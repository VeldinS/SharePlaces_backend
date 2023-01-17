const express = require('express');
const { check } = require('express-validator')

const placesControllers = require('../controllers/places-controllers');


/////////////////////////////////////////////////////
const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);       //IMPORTING ROUTE FOR GETTING PLACES BY THEIR UNIQUE ID

router.get('/user/:uid', placesControllers.getPlacesByUserId)   //IMPORTING ROUTE FOR GETTING ALL PLACES FOR SOME USER ID

router.post('/',     //IMPORTING ROUTE FOR CREATING NEW PLACE
    [
        check('title')      //VALIDATIONS FOR INPUT FIELDS
            .not()
            .isEmpty(),
        check('description').isLength({min: 5}),
        check('address')
            .not()
            .isEmpty()
    ],
    placesControllers.createPlace);

router.patch('/:pid',           //IMPORTING ROUTE FOR EDITING A PLACE
    [
        check('title')          //VALIDATIONS FOR UPDATING FIELDS
                .not()
                .isEmpty(),
        check('description').isLength({min: 5})
    ],
    placesControllers.updatePlace);

router.delete('/:pid', placesControllers.deletePlace);   //IMPORTING ROUTE FOR DELETING A PLACE

module.exports = router;