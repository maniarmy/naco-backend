const express = require('express');
const HttpError = require('../models/http-error');
const recoveryControllers = require('../controllers/recovery-controllers');
const {check} = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.post('/newrecovery',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(),
    [
        check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

        check('recoverydate')
        .not()
        .isEmpty().withMessage('recoverydate is required')
        .isISO8601().withMessage('recoverydate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('recoverydate must be in the past');
            }
            return true;
        }),

        check('notes')
        .notEmpty().withMessage('notes is required')
        .isLength({min: 3}),
        
        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
    ],
    
    recoveryControllers.registerRecovery);


    router.put('/updaterecovery',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(),
        [
            check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
    
            check('new_recovery_date')
            .not()
            .isEmpty().withMessage('recoverydate is required')
            .isISO8601().withMessage('recoverydate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('recoverydate must be in the past');
                }
                return true;
            }),
    
            check('new_notes')
            .notEmpty().withMessage('notes is required')
            .isLength({min: 3}),
            
            check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required')
        ],
        
        recoveryControllers.updateRecovery);

module.exports = router;