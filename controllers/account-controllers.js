const pool = require('../db');
const HttpError = require('../models/http-error');

const getAccounts = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM account');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch accounts, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ accounts: result.rows });
};

exports.getAccounts = getAccounts;