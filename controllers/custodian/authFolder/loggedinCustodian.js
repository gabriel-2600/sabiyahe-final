const db = require('../../../routes/db-config');
const jwt = require('jsonwebtoken');

const loggedInCustodian = (req, res, next) => {
    if(!req.cookies.custodianUser) return next();
    try {
        const decoded = jwt.verify(req.cookies.custodianUser, 'secretkeywebtech');
        db.query('SELECT * FROM users WHERE user_id = ?', [decoded.id], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return next();
            }
            // console.log('User from database:', result[0]);
            req.custodianUser = result[0];
            return next();
        });
    } catch(err) {
        console.error('Error decoding token:', err);
        return next();
    }
}
module.exports = loggedInCustodian;
