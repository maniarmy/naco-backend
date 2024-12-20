const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const getTransactions = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM transaction');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch transactions, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ transaction: result.rows });
};

const getTransactionsById = async (req, res, next) => {
    const ranchId = req.params.ranchid;
    let result;
    try {
        result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'ranch_id' = $1`,
            [ranchId]
        );
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch transactions, try again later', 500
        );
    return next(dbError);
    }
    // Check if the cattle exists
    if (result.rows.length === 0) {
        const error = new HttpError('cattle not found', 404);
        return next(error);
    }

    return res.json({ cattle: result.rows });
};

const registerSale = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { p_tag_no, saledate, price, marketname, ranch_id} = req.body;
    let result;
    try {

        const existingTransaction = await pool.query(
            `SELECT t.cattle_id, t.trans_type 
             FROM transaction t
             JOIN cattle c ON t.cattle_id = c.id
             WHERE c.tag_no = $1 AND t.trans_type = 'Sale'`,
            [p_tag_no]
        );

        if (existingTransaction.rows.length > 0) {
            return next(new HttpError(`Cattle with tag number ${p_tag_no} already has a Sale transaction`, 400));
        }

        result = await pool.query(
            `CALL register_sale($1, $2, $3, $4, $5)`,
           [p_tag_no, saledate, price, marketname, ranch_id]
        );
        
            result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1`,
            [p_tag_no]
        );
        
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Failed to register sale, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ Sales: result.rows[0] });
}


const updateSale = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }
    const { 
        p_tag_no, 
        new_sale_date,
        new_price,
        new_market_name, 
        new_ranch_id 
    } = req.body;

    let result;
    try {
        await pool.query(
            `CALL update_sale($1, $2, $3, $4, $5)`,
            [p_tag_no, new_sale_date, new_price, new_market_name, new_ranch_id]
        );
        result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1 AND trans_type = 'Sale'`,
            [p_tag_no]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Failed to update sales information, try again later', 500); 
        return next(error);
    }
    res.status(200).json({ updatedsale: result.rows[0] });
    
};

const deleteTransaction = async (req, res, next) => {
    const {transId, ranch_id} = req.params;
    let result;

    try {
        const ranchResult = await pool.query(
            `SELECT details->>'ranch_id' AS trans_ranch_id
             FROM transaction 
             WHERE id = $1`,
            [transId]
        );

        if (ranchResult.rows.length === 0) {
            return next(new HttpError('Transaction not found', 404));
        }

        const transRanchId = ranchResult.rows[0].trans_ranch_id;
        
        if (String(transRanchId) !== String(ranch_id)) {
            return next(new HttpError('transaction not belong under provided ranchId.', 403));
        }

        result = await pool.query(
            'DELETE FROM transaction WHERE id = $1 RETURNING *',
            [transId]
        );

    } catch (err) {
        console.error(err);
        const error = new HttpError('Deleting transaction failed, try again later', 500
        );
        return next(error);
    }

    if (result.rows.length === 0) {
        const error = new HttpError('transaction not found', 404);
        return next(error);
    }

    res.status(200).json({ message: 'Successful Deleted transaction.' });
};

exports.getTransactions = getTransactions;
exports.getTransactionsById = getTransactionsById;
exports.registerSale = registerSale;
exports.updateSale = updateSale;
exports.deleteTransaction = deleteTransaction; 