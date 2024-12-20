const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const getRanches = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM ranches');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch ranches, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ ranches: result.rows });
};


const createRanches = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { name } = req.body;
    let result;
    try {
        result = await pool.query(
            'INSERT INTO ranches (name) VALUES ($1) RETURNING *',
            [name]
        );
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Creating ranch failed, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ ranch: result.rows[0] });
}

const updateRanch = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { name } = req.body;
    const ranchId = req.params.rid;
    let result;
    try {
        result = await pool.query(
            'UPDATE ranches SET name = $1 WHERE id = $2 RETURNING *',
            [name, ranchId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Updating ranch failed, try again later', 500
        );
        return next(error);
    }
    // Check if the category exists
    if (result.rows.length === 0) {
        const error = new HttpError('ranch not found', 404);
        return next(error);
    }
    res.status(200).json({ ranch: result.rows[0] });
};


const deleteRanch = async (req, res, next) => {
    const ranchId = req.params.rid;
    let result;

    try {
        result = await pool.query(
            'DELETE FROM ranches WHERE id = $1 RETURNING *',
            [ranchId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Deleting ranch failed, try again later', 500
        );
        return next(error);
    }

    if (result.rows.length === 0) {
        const error = new HttpError('ranch not found', 404);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted ranch.' });
};

exports.getRanches = getRanches;
exports.createRanches = createRanches;
exports.updateRanch = updateRanch;
exports.deleteRanch = deleteRanch;