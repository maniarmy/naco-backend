const express = require('express');
const HttpError = require('../models/http-error');
const slaughterControllers = require('../controllers/slaughter-controller');
const {check} = require('express-validator');
const { authenticate, authorizeRole, authorizeRanchIdCattle } = require('../middleware/check-auth');

const router = express.Router();

router.post('/newslaughter',
    authenticate,
    authorizeRole(['Recorder']),
    authorizeRanchIdCattle(),
    [
    check('p_tag_no')
        .not()
        .isEmpty().withMessage('tag_no is required'),

    check('slaughterdate')
        .not()
        .isEmpty().withMessage('slaughterdate is required')
        .isISO8601().withMessage('slaughterdate must be a valid ISO8601 date format')
        .custom(value => {
            const today = new Date();
            if (value >= today) {
                throw new Error('slaughterdate must be in the past');
            }
            return true;
        }),

    check('ranch_id')
        .not()
        .isEmpty().withMessage('ranchid is required')
    ],
    slaughterControllers.registerSlaughter);


    router.patch('/updateslaughter',
        authenticate,
        authorizeRole(['Recorder']),
        authorizeRanchIdCattle(),
        [
        check('p_tag_no')
            .not()
            .isEmpty().withMessage('tag_no is required'),
    
        check('new_slaughter_date')
            .not()
            .isEmpty().withMessage('slaughterdate is required')
            .isISO8601().withMessage('slaughterdate must be a valid ISO8601 date format')
            .custom(value => {
                const today = new Date();
                if (value >= today) {
                    throw new Error('slaughterdate must be in the past');
                }
                return true;
            }),
    
        check('new_ranch_id')
            .not()
            .isEmpty().withMessage('ranchid is required')
        ],
        slaughterControllers.updateSlaughter);
module.exports = router;