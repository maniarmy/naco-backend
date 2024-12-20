const express = require('express');
const HttpError = require('../models/http-error');
const {check} = require('express-validator');
const ranchesControllers = require('../controllers/ranches-controllers');
const { authenticate, authorizeRole } = require('../middleware/check-auth');

const router = express.Router();

router.get('/getranches',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor']),
    ranchesControllers.getRanches);

router.post('/createranch',
    authenticate,
    authorizeRole(['Admin']), 
        [
        check('name')
        .not()
        .isEmpty()
        .isLength({min: 2}) 
        ],
    ranchesControllers.createRanches);

    router.patch('/updateranch/:rid',
        authenticate,
        authorizeRole(['Admin']), 
            [
            check('name')
            .not()
            .isEmpty()
            .isLength({min: 2}) 
            ],
        ranchesControllers.updateRanch);

    router.delete('/deleteranch/:rid',
        authenticate,
        authorizeRole(['Admin']),

        ranchesControllers.deleteRanch);

module.exports = router;