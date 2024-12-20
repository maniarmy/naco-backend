const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const HttpError = require('../models/http-error');
const { logActivity } = require('../middleware/logging'); 

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid input passed, please check your data', 422)
    );
  }

  const { username, password, role, ranch_id } = req.body;

  // Check if the username already exists
  let existingUser;
  try {
    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    existingUser = result.rows[0];
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later', 500); 
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError('Username already exists', 422);
    return next(error);
  }

   // Hash the password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); 
  } catch (err) {
    const error = new HttpError('Could not create a user, please try again later', 500);
    return next(error);
  }

  // Insert the new user into the database
  let createdUser;
  try {
    const result = await pool.query(
      `INSERT INTO users (username, password, role, ranch_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, role, created_at`,
      [username, hashedPassword, role, ranch_id || null]
    );
    createdUser = result.rows[0];
  } catch (err) {
    const error = new HttpError('Creating user failed, please try again later', 500);
    return next(error);
  }

  // Generate a JWT token
  let token;
  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        username: createdUser.username,
        role: createdUser.role,
        ranchId: createdUser.ranch_id
      },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError('Signup failed, please try again later', 500);
    return next(error);
  }

  res.status(201).json({
    userId: createdUser.id,
    username: createdUser.username,
    role: createdUser.role,
    ranchId: createdUser.ranch_id,
    createdAt: createdUser.created_at,
    token: token,
  });
};


const login = async (req, res, next) => {
    const { username, password } = req.body;
  
    // Find user by username
    let existingUser;
    try {
      const result = await pool.query(
        'SELECT id, username, password, role, ranch_id FROM users WHERE username = $1',
        [username]
      );
      existingUser = result.rows[0];
    } catch (err) {
      const error = new HttpError('Login failed, please try again later.', 500);
      return next(error);
    }
  
    if (!existingUser) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    if (!existingUser.password) {
        const error = new HttpError('Login failed, please try again later.', 500);
        return next(error);
      }

    //Check if the password matches
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
      const error = new HttpError('Login failed, please try again later.', 500);
      return next(error);
    }
  
    if (!isValidPassword) {
      const error = new HttpError(
        'Invalid credentials, could not log you in.',
        401
      );
      return next(error);
    }
  
    // Step 3: Generate a JWT token
    let token;
    try {
      token = jwt.sign(
        {
          userId: existingUser.id,
          username: existingUser.username,
          role: existingUser.role,
          ranchId: existingUser.ranch_id
        },
        process.env.JWT_KEY, // Replace with your secret key
        { expiresIn: '1h' }
      );
    } catch (err) {
      console.error('JWT generation error:', err.message);
      const error = new HttpError('Login failed, please try again later.', 500);
      return next(error);
    }
  
      // Log the login activity
    try {
      await logActivity(existingUser.id, 'Login');
        } catch (err) {
      console.error('Logging activity failed:', err.message);
        }
    
    //Respond with token
    res.json({
      userId: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
      ranchId: existingUser.ranch_id,
      token: token
    });
  };


  const updateUser = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return next(new HttpError('Invalid input passed, please check your data', 422));
    }

    const { username, role, ranch_id } = req.body;
    const userId = req.params.uid;
    let result;
    try {
        result = await pool.query(
            'UPDATE users SET username = $1, role = $2, ranch_id = $3 WHERE id = $4 RETURNING *',
            [username, role, ranch_id, userId]
        );
    } catch (err) {
        console.error(err);
        const error = new HttpError('Updating user failed, try again later', 500
        );
        return next(error);
    }
    // Check if the category exists
    if (result.rows.length === 0) {
        const error = new HttpError('user not found', 404);
        return next(error);
    } 
    res.status(200).json({ user: result.rows[0] });
};

  
const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid input passed, please check your data', 422)
    );
  }

  const { userId, newpassword } = req.body;

  let existingUser;
  try {
    const result = await pool.query(
      'SELECT id, password FROM users WHERE id = $1',
      [userId]
    );
    existingUser = result.rows[0];
  } catch (err) {
    const error = new HttpError('failed, please try again later.', 500);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      'user not exist.',
      401
    );
    return next(error);
  }

  //Check if the password matches
  let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(newpassword, existingUser.password);
    } catch (err) {
      const error = new HttpError('reset pass failed, please try again later.', 500);
      return next(error);
    }
  
    if (isValidPassword) {
      const error = new HttpError(
        'New password cannot be the same as the current password.',
        401
      );
      return next(error);
    }

// Hash the password
  let hashedPassword;
    try {
  hashedPassword = await bcrypt.hash(newpassword, 12); 
} catch (err) {
  const error = new HttpError('Could not reset password, please try again later', 500);
  return next(error);
}

// Insert the new user into the database
let updatePassword;
try {
  const result = await pool.query(
    'UPDATE users SET password = $1 WHERE id = $2 RETURNING id', [hashedPassword, userId]
  );
  updatePassword = result.rows[0];
} catch (err) {
  const error = new HttpError('Updating password failed, please try again later', 500);
  return next(error);
}

res.status(201).json({
  message: 'Password updated successfully.',
  userId: updatePassword.id,
});
}


const deleteUser = async (req, res, next) => {
  const userId = req.params.uid;
  let result;

  try {
      result = await pool.query(
          'DELETE FROM users WHERE id = $1 RETURNING *',
          [userId]
      );
  } catch (err) {
      const error = new HttpError('Deleting user failed, try again later', 500
      );
      return next(error);
  }

  if (result.rows.length === 0) {
      const error = new HttpError('user not found', 404);
      return next(error);
  }

  res.status(200).json({ message: 'successfull Deleted a user.' });
};

exports.signup = signup;
exports.login = login;
exports.updateUser = updateUser;
exports.resetPassword = resetPassword;
exports.deleteUser = deleteUser;
