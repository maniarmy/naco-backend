const express = require('express');
const HttpError = require('../models/http-error');
const SubcategoriesControllers = require('../controllers/subcategories-controller');
const router = express.Router();
const {check} = require('express-validator');
const { authenticate, authorizeRole } = require('../middleware/check-auth');

router.get('/subcategory', 
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']),
    SubcategoriesControllers.getallSubcategories);

router.get('/:cname/subcategory', 
    authenticate,
    authorizeRole(['Admin', 'Managing Director', 'Supervisor', 'Ranch Manager', 'Recorder']),
    SubcategoriesControllers.getSubcategories);

router.post('/subcategories',
    authenticate,
    authorizeRole(['Admin']),
    
    [
        check('categoryName')
        .not()
        .isEmpty().withMessage('categoryname is required')
        .isLength({min: 2}) 
    ],
    SubcategoriesControllers.createSubcategories);

router.patch('/updatesubcategory/:sid',
    authenticate,
    authorizeRole(['Admin']), 
        [
        check('name')
        .not()
        .isEmpty().withMessage('name is required'),
        ],
    SubcategoriesControllers.updateSubcategory);

router.delete('/deletesubcategory/:sid',
    authenticate,
    authorizeRole(['Admin']),
    SubcategoriesControllers.deleteSubcategory);

module.exports = router;
