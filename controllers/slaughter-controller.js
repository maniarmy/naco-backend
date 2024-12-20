const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const registerSlaughter = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { p_tag_no, slaughterdate, ranch_id} = req.body;
    let result;
    try {

        const existingTransaction = await pool.query(
            `SELECT t.cattle_id, t.trans_type 
             FROM transaction t
             JOIN cattle c ON t.cattle_id = c.id
             WHERE c.tag_no = $1 AND t.trans_type = 'Slaughter'`,
            [p_tag_no]
        );

        if (existingTransaction.rows.length > 0) {
            return next(new HttpError(`Cattle with tag number ${p_tag_no} already has a slaughter transaction`, 400));
        }

        result = await pool.query(
            `CALL register_slaughter($1, $2, $3)`,
           [p_tag_no, slaughterdate, ranch_id]
        );
        
            result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1 AND details->>'slaughter_date' = $2`,
            [p_tag_no, slaughterdate]
        );
        
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Failed to register slaughter, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ category: result.rows[0] });
}


const updateSlaughter = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }
    const { 
        p_tag_no, 
        new_slaughter_date,  
        new_ranch_id 
    } = req.body;

    let result;
    try {
        await pool.query(
            `CALL update_slaughter($1, $2, $3)`,
            [p_tag_no, new_slaughter_date,new_ranch_id]
        );
        result = await pool.query(
            `SELECT * FROM transaction WHERE details->>'tag_no' = $1 AND trans_type = 'Slaughter'`,
            [p_tag_no]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Failed to update slaughter information, try again later', 500); 
        return next(error);
    }
    res.status(200).json({ updatedslaughter: result.rows[0] });
    
};

exports.registerSlaughter = registerSlaughter; 
exports.updateSlaughter = updateSlaughter;
