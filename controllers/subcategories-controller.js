const pool = require('../db');
const HttpError = require('../models/http-error');
const {validationResult} = require('express-validator');

const getallSubcategories = async (req, res, next) => {
    let result;
    try {
        result = await pool.query('SELECT * FROM subcategories');
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch subcategories, try again later', 500
        );
    return next(dbError);
    }
    return res.json({ subcategories: result.rows });
};


const getSubcategories = async (req, res, next) => {
    const categoryName = req.params.cname;
    let result;
    try {
        result = await pool.query(`SELECT subcategories.* 
             FROM subcategories
             JOIN categories ON subcategories.categories_id = categories.id
             WHERE categories.name = $1`,
            [categoryName] 
        );
    } 
    catch (error) {
        const dbError = new HttpError('Failed to fetch categories, try again later', 500
        );
    return next(dbError);
    }
    // Check if the subcategory exists
    if (result.rows.length === 0) {
        const error = new HttpError('subcategory not found', 404);
        return next(error);
    }

    return res.json({ subcategories: result.rows });
};


const createSubcategories = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { categoryName, subcategories } = req.body;  
    let result;
    try {
        const categoryResult = await pool.query(
            'SELECT id FROM categories WHERE name = $1',
            [categoryName]
        );
        
        if (categoryResult.rows.length === 0) {
            const error = new HttpError('Category not found, try again later', 404);
            return next(error);
        }
        const categoryId = categoryResult.rows[0].id;

        const insertPromises = subcategories.map((subcategoryName) => {
            return pool.query(
                'INSERT INTO subcategories (categories_id, name) VALUES ($1, $2) RETURNING *',
                [categoryId, subcategoryName]
            );
        });
        // Wait for all subcategory inserts to complete
        result = await Promise.all(insertPromises);

        const insertedSubcategories = result.map(r => r.rows[0]);

        res.status(201).json({ subcategories: insertedSubcategories });

    } catch (err) {
        console.error(err);
        const error = new HttpError('Creating subcategories failed, try again later', 500
        );
        return next(error);
    }
};


const updateSubcategory = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { name } = req.body;
    const subcategoryId = req.params.sid;
    let result;
    try {
        result = await pool.query(
            'UPDATE subcategories SET name = $1 WHERE id = $2 RETURNING *',
            [name, subcategoryId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Updating subcategory failed, try again later', 500
        );
        return next(error);
    }
    // Check if the category exists
    if (result.rows.length === 0) {
        const error = new HttpError('Subcategory not found', 404);
        return next(error);
    }
    res.status(200).json({ subcategory: result.rows[0] });
};


const deleteSubcategory = async (req, res, next) => {
    const subcategoryId = req.params.sid;
    let result;

    try {
        result = await pool.query(
            'DELETE FROM subcategories WHERE id = $1 RETURNING *',
            [subcategoryId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Deleting subcategory failed, try again later', 500
        );
        return next(error);
    }

    if (result.rows.length === 0) {
        const error = new HttpError('Subcategory not found', 404);
        return next(error);
    }

    res.status(200).json({ message: 'successfull Deleted subcategory.' });
};

exports.getallSubcategories = getallSubcategories;
exports.getSubcategories = getSubcategories;
exports.createSubcategories = createSubcategories;
exports.updateSubcategory = updateSubcategory;
exports.deleteSubcategory = deleteSubcategory;