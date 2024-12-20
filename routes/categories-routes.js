const express = require('express');
const HttpError = require('../models/http-error');
const {check} = require('express-validator');
const categoriesControllers = require('../controllers/categories-controllers');
const { authenticate, authorizeRole } = require('../middleware/check-auth');

const router = express.Router();

router.get('/categories',
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']),
    categoriesControllers.getCategories);

router.post('/createcategories',
    authenticate,
    authorizeRole(['Admin']), 
        [
        check('name')
        .not()
        .isEmpty()
        .isLength({min: 2}) 
        ],
    categoriesControllers.createCategories);

router.patch('/updatecategory/:cid',
    authenticate,
    authorizeRole(['Admin']), 
       [
        check('name')
        .not()
        .isEmpty().withMessage('name is required'),
        ],
    categoriesControllers.updateCategory);
    
router.delete('/deletecategory/:cid',
    authenticate,
    authorizeRole(['Admin']),
    categoriesControllers.deleteCategory);

module.exports = router;