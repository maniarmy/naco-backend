const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const getCattle = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM cattle');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch cattle, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ cattles: result.rows });
};

const getCattleById = async (req, res, next) => {
    const ranchId = req.params.ranchid;
    let result;
    try {
        result = await pool.query(`SELECT * FROM cattle WHERE cattle.ranch_id = $1`,
            [ranchId] 
        );
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch cattle, try again later', 500
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

const registerCattle = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { p_tag_no, birthdate, ranch_id, origin, category_name, subcategory_name } = req.body;
    let result;
    try {
        result = await pool.query(
            `CALL register_new_cattle($1, $2, $3, $4, $5, $6)`,
           [p_tag_no, birthdate, ranch_id, origin, category_name, subcategory_name]
        );

            result = await pool.query(
            `SELECT * FROM cattle WHERE tag_no = $1`,
            [p_tag_no]
        );
         
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Failed to register a new cattle, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ cattles: result.rows[0] });
}


const updateCattle = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }
    const {
        p_tag_no,
        new_birthdate,
        new_ranch_id,
        new_origin,
        new_category_name,
        new_subcategory_name
    } = req.body;

    let result;
    try {
        await pool.query(
            `CALL update_cattle($1, $2, $3, $4, $5, $6)`,
            [
                p_tag_no,
                new_birthdate,
                new_ranch_id,
                new_origin,
                new_category_name,
                new_subcategory_name
            ]
        );
        result = await pool.query(
            `SELECT * FROM cattle WHERE tag_no = $1`,
            [p_tag_no]
        );
    } 
    catch (err) {
        const error = new HttpError('Failed to update cattle, try again later', 500);
        return next(error);
    }
    res.status(200).json({ cattle: result.rows[0] });
};


const deleteCattle = async (req, res, next) => {
    const { tag_no, ranch_id } = req.params;
    try {
        const ranchResult = await pool.query(
            `SELECT ranch_id FROM cattle WHERE tag_no = $1`,
            [tag_no]
        );

        const cattleRanchId = ranchResult.rows[0].ranch_id;
        
        if (String(cattleRanchId) !== String(ranch_id)) {
            return next(new HttpError('cattle not belong under provided ranchId.', 403));
        }

        await pool.query('CALL delete_cattle($1)', [tag_no]);

        res.status(200).json({ message: `Cattle with tag_no '${tag_no}' deleted successfully.` });
    } 
    catch (err) {
        const error = new HttpError(
            'Failed to delete cattle, try again later', 500  
        );
        return next(error);
    }
};

exports.getCattle = getCattle;
exports.getCattleById = getCattleById;
exports.registerCattle = registerCattle;
exports.updateCattle = updateCattle;
exports.deleteCattle = deleteCattle;
