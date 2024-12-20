const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const registerRecovery = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { p_tag_no, recoverydate, notes, ranch_id } = req.body;
    let result;
    try {

        const existingTransaction = await pool.query(
            `SELECT t.cattle_id, t.trans_type 
             FROM transaction t
             JOIN cattle c ON t.cattle_id = c.id
             WHERE c.tag_no = $1 AND t.trans_type = 'Recovery'`,
            [p_tag_no]
        );

        if (existingTransaction.rows.length > 0) {
            return next(new HttpError(`Cattle with tag number ${p_tag_no} already has a Recovery transaction`, 400));
        }

        result = await pool.query(
            `CALL register_recovery($1, $2, $3, $4)`,
           [p_tag_no, recoverydate, notes, ranch_id]
        );
        
            result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1 AND details->>'recovery_date' = $2`,
            [p_tag_no, recoverydate]
        );
        
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Failed to register recovery information, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ recovery: result.rows[0] });
}


const updateRecovery = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }
    const { 
        p_tag_no, 
        new_recovery_date, 
        new_notes, 
        new_ranch_id 
    } = req.body;

    let result;
    try {
        await pool.query(
            `CALL update_recovery($1, $2, $3, $4)`,
            [p_tag_no, new_recovery_date, new_notes, new_ranch_id]
        );
        result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1 AND trans_type = 'Recovery'`,
            [p_tag_no]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Failed to update recovery information, try again later', 500); 
        return next(error);
    }
    res.status(200).json({ updatedrecovery: result.rows[0] });
    
};

exports.registerRecovery = registerRecovery;
exports.updateRecovery = updateRecovery;