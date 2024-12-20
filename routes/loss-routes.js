const express = require('express');
const lossControllers = require('../controllers/loss-controllers');
const {check} = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.post('/newdeath',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(),
    [
    check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

        check('deathdate')
        .not()
        .isEmpty().withMessage('deathdate is required')
        .isISO8601().withMessage('deathdate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('deathdate must be in the past');
            }
            return true;
        }),

        check('reason')
        .notEmpty().withMessage('reason is required')
        .isLength({min: 3}),

        check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
    ],
    lossControllers.registerDeath);

    router.patch('/updatedeath',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(),
        [
        check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
    
            check('new_death_date')
            .not()
            .isEmpty().withMessage('deathdate is required')
            .isISO8601().withMessage('deathdate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('deathdate must be in the past');
                }
                return true;
            }),
    
            check('new_reason')
            .notEmpty().withMessage('reason is required')
            .isLength({min: 3}),
    
            check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required')
        ],
        lossControllers.updateDeath);

module.exports = router;