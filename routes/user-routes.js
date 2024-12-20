const express = require('express');
const {check} = require('express-validator');
const usersController = require('../controllers/user-controller');
const { authenticate, authorizeRole } = require('../middleware/check-auth');

const router = express.Router();

   router.post('/signup',
    authenticate,
    authorizeRole(['Admin']),
    [
        check('username')
        .notEmpty().withMessage('username is required')
        .isLength({min: 2}),

        check('password')
        .notEmpty().withMessage('password is required')
        .isLength({min: 8}).withMessage('password must be 8 character'),
        
        check('role')
        .notEmpty().withMessage('role is required')
        .isIn(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']).withMessage('Invalid role specified'),
        
        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
        ],
        usersController.signup);

   router.post('/login',
    //authenticate,
    //authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']),
        [
            check('username')
            .notEmpty().withMessage('password is required')
            .isLength({min: 2}),
    
            check('password')
            .notEmpty().withMessage('password is required')
            .isLength({min: 8}).withMessage('password must be 8 character')
        ],
        usersController.login);

    router.patch('/updateuser/:uid',
        authenticate,
        authorizeRole(['Admin']),
        [
            check('username')
            .notEmpty().withMessage('username is required')
            .isLength({min: 2}),
            
            check('role')
            .notEmpty().withMessage('role is required')
            .isIn(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder', 'Null']).withMessage('Invalid role specified'),
                
            check('ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required')
        ],
            usersController.updateUser);


    router.patch('/resetpassword',
        authenticate,
        authorizeRole(['Admin']),
        [
            check('userId')
            .notEmpty().withMessage('userId is required'),
        
            check('newpassword')
            .notEmpty().withMessage('password is required')
            .isLength({min: 8}).withMessage('password must be 8 character')
        ],
            usersController.resetPassword);

    router.delete('/deleteuser/:uid',
        authenticate,
        authorizeRole(['Admin']),
        usersController.deleteUser);
    
module.exports = router;