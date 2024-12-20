const express = require('express');
const HttpError = require('../models/http-error');
const transferControllers = require('../controllers/transfer-controller');
const {check} = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.post('/newtransfer',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(), 
    [
        check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

        check('transferdate')
        .not()
        .isEmpty().withMessage('transferdate is required')
        .isISO8601().withMessage('transferdate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('transferdate must be in the past');
            }
            return true;
        }),

        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required'),

        check('reason')
        .notEmpty().withMessage('reason is required')
        .isLength({min: 3}),

        check('newranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
    ],

    transferControllers.registerTransfer);


    router.patch('/updatetransfer',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(), 
        [
            check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
     
            check('new_transfer_date')
            .not()
            .isEmpty().withMessage('transferdate is required')
            .isISO8601().withMessage('transferdate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('transferdate must be in the past');
                }
                return true;
            }),

            check('ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required'),
    
            check('new_reason')
            .notEmpty().withMessage('reason is required')
            .isLength({min: 3}),
    
            check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required') 
        ],
        
        transferControllers.updateTransfer);

module.exports = router;