const express = require('express');
const { check } = require('express-validator')

const usersControllers = require('../controllers/users-controller');


/////////////////////////////////////////////////////
const router = express.Router();

router.get('/', usersControllers.getUsers);         //ROUTE GETTING FULL LIST OF USERS

router.post('/signup',          //ROUTE FOR SIGNUP
    [
        check('name')
            .not()
            .isEmpty(),         //VALIDATIONS FOR INPUT DATA
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({min: 6})
    ],
    usersControllers.signup);

router.post('/login', usersControllers.login);      //ROUTE FOR LOGIN

module.exports = router;