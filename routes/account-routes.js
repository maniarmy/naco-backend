const express = require('express');
const HttpError = require('../models/http-error');
const accountsControllers = require('../controllers/account-controllers');
const { authenticate, authorizeRole } = require('../middleware/check-auth');

const router = express.Router();

router.get('/accounts',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor']),

    accountsControllers.getAccounts);

module.exports = router;    