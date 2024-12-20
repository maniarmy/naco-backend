const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const getCategories = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM categories');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch categories, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ categories: result.rows });
};


const createCategories = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { name } = req.body;
    let result;
    try {
        result = await pool.query(
            'INSERT INTO categories (name) VALUES ($1) RETURNING *',
            [name]
        );
    } 
    catch (err) {
        console.error(err);
        const error = new HttpError('Creating category failed, try again later', 500
        );
        return next(error);
    }
    res.status(201).json({ category: result.rows[0] });
}


const updateCategory = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { name } = req.body;
    const categoryId = req.params.cid;
    let result;
    try {
        result = await pool.query(
            'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
            [name, categoryId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Updating category failed, try again later', 500
        );
        return next(error);
    }
    // Check if the category exists
    if (result.rows.length === 0) {
        const error = new HttpError('Category not found', 404);
        return next(error);
    }
    res.status(200).json({ category: result.rows[0] });
};


const deleteCategory = async (req, res, next) => {
    const categoryId = req.params.cid;
    let result;

    try {
        result = await pool.query(
            'DELETE FROM categories WHERE id = $1 RETURNING *',
            [categoryId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Deleting category failed, try again later', 500
        );
        return next(error);
    }

    if (result.rows.length === 0) {
        const error = new HttpError('Category not found', 404);
        return next(error);
    }

    res.status(200).json({ message: 'Deleted category.' });
};

exports.getCategories = getCategories;
exports.createCategories = createCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;