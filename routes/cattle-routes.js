const express = require('express');
const HttpError = require('../models/http-error');
const cattleControllers = require('../controllers/cattle-controllers');
const { check } = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.get('/getcattle',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor']),
    cattleControllers.getCattle);

router.get('/getcattle/:ranchid',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager']),
    cattleControllers.getCattleById);

router.post('/newcattle',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(), 
    [
        check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

        check('birthdate')
        .not()
        .isEmpty().withMessage('Birthdate is required')
        .isISO8601().withMessage('Birthdate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('Birthdate must be in the past');
            }
            return true;
        }),

        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required'),

        check('origin')
        .notEmpty().withMessage('origin is required')
        .isLength({min: 3}),

        check('category_name')
        .notEmpty().withMessage('category_name is required')
        .isLength({min: 2}),

        check('subcategory_name')
        .notEmpty().withMessage('subcategory_name is required')
        .isLength({min: 2})
        ],
            
    cattleControllers.registerCattle);


    router.patch('/updatecattle',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(), 
        [
            check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
    
            check('new_birthdate')
            .not()
            .isEmpty().withMessage('Birthdate is required')
            .isISO8601().withMessage('Birthdate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('Birthdate must be in the past');
                }
                return true;
            }),
    
            check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required'),
    
            check('new_origin')
            .notEmpty().withMessage('origin is required')
            .isLength({min: 3}),
    
            check('new_category_name')
            .notEmpty().withMessage('category_name is required')
            .isLength({min: 2}),
    
            check('new_subcategory_name')
            .notEmpty().withMessage('subcategory_name is required')
            .isLength({min: 2})
            ],
                
        cattleControllers.updateCattle);


    router.delete('/deletecattle/:tag_no/:ranch_id',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(),

        cattleControllers.deleteCattle
    );

module.exports = router;