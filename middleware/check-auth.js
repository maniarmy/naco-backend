const jwt = require('jsonwebtoken');
const pool = require('../db');
const HttpError = require('../models/http-error');

const authenticate = (req, res, next) => {
  if(req.method === 'OPTIONS'){
    return next();
  }
  try { 
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authorization header missing or improperly formatted.');
    }

    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId, role: decodedToken.role, ranchId: decodedToken.ranchId };
    next();
  } catch (err) {
    console.log(err)
    const error = new HttpError('Authentication failed!, try again later', 401); 
    return next(error);
  }
};

const authorizeRole = (roles) => (req, res, next) => {
  try {
    if (!roles.includes(req.userData.role)) {
      throw new HttpError('Access Denied: You do not have the required permissions.', 403);
    }
    next();
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const authorizeRanchId = () => async (req, res, next) => {
  try {
    if (!req.userData.ranchId) {
      throw new HttpError('Access Denied: No ranch ID found in token.', 403);
    }

    const { p_tag_no } = req.body;

    const result = await pool.query(
      `SELECT ranch_id FROM cattle WHERE tag_no = $1`,
      [p_tag_no]
    );

    const ranchIdFromDb = result.rows[0].ranch_id || new_ranch_id;

    if ((req.userData.ranchId) !== (ranchIdFromDb)) {
      throw new HttpError('Access Denied: You do not have permission for this ranch.', 403);
    }

    next();
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

const authorizeRanchIdCattle = () => async (req, res, next) => {
  try {
    if (!req.userData.ranchId) {
      throw new HttpError('Access Denied: No ranch ID found in token.', 403);
    }

    const requestedRanchId = req.body.ranch_id || req.body.new_ranch_id || req.params.ranch_id;

    if (!requestedRanchId) {
      throw new HttpError('Access Denied: No ranch ID provided in the request.', 403);
    }

    if (String(req.userData.ranchId) !== String(requestedRanchId)) {
      throw new HttpError('Access Denied: You do not have permission for this ranch.', 403);
    }

    next();
  } catch (err) {
    console.error(err);
    return next(err);
  }
};

module.exports = { authenticate, authorizeRole, authorizeRanchId,  authorizeRanchIdCattle};