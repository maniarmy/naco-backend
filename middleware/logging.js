
const pool = require('../db');
const HttpError = require('../models/http-error');

const logActivity = async (userId, activity) => {
    const query = `INSERT INTO activity_logs (userid, activity) VALUES ($1, $2)`;
    try {
        await pool.query(query, [userId, activity]);
    } catch (err) {
        throw new HttpError('Failed to log activity', 500);
    }
};

module.exports = { logActivity };
