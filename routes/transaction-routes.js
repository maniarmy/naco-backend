const express = require('express');
const HttpError = require('../models/http-error');
const transactionControllers = require('../controllers/transaction-controllers');
const {check} = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.get('/gettransactions',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor']),
    transactionControllers.getTransactions);

router.get('/gettransactions/:ranchid',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']),
    transactionControllers.getTransactionsById);

router.post('/registertransaction',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(), 
    [
        check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

        check('saledate')
        .not()
        .isEmpty().withMessage('saledate is required')
        .isISO8601().withMessage('saledate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('saledate must be in the past');
            }
            return true;
        }),

        check('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),

        check('marketname')
        .not()
        .isEmpty().withMessage('marketname is required')
        .isLength({min: 2}),
        
        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
    ],
    
    transactionControllers.registerSale);


    router.patch('/updatetransaction',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(), 
        [
            check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
    
            check('new_sale_date')
            .not()
            .isEmpty().withMessage('saledate is required')
            .isISO8601().withMessage('saledate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('saledate must be in the past');
                }
                return true;
            }),
    
            check('new_price')
            .notEmpty().withMessage('Price is required')
            .isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    
            check('new_market_name')
            .not()
            .isEmpty().withMessage('marketname is required')
            .isLength({min: 2}),
            
            check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required')
        ],
        
        transactionControllers.updateSale);


     router.delete('/deletetransaction/:transId/:ranch_id',
             authenticate,
             authorizeRole(['Recorder']),
             authorizeRanchIdCattle(),
     
             transactionControllers.deleteTransaction
         );

module.exports = router;