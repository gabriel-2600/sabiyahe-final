const db = require('../../../routes/db-config');
const jwt = require('jsonwebtoken');

const loggedIn = (req, res, next) => {
    if(!req.cookies.studentUser) return next();
    try {
        const decoded = jwt.verify(req.cookies.studentUser, 'secretkeywebtech');
        db.query('SELECT * FROM users WHERE user_id = ?', [decoded.id], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return next();
            }
            // console.log('User from database:', result[0]);
            req.user = result[0];
            return next();
        });
    } catch(err) {
        console.error('Error decoding token:', err);
        return next();
    }
}
module.exports = loggedIn;
