const jwt = require('jsonwebtoken');
const db = require('../../routes/db-config');

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.json({ status: 'error', error: 'Please enter username or password' });
    }

    const userTypeQuery = 'SELECT user_id, type, password FROM users WHERE username = ?';
    db.query(userTypeQuery, [username], async (err, result) => {
        if (err) {
            console.error('Database query error:', err);
            return res.json({ status: 'error', error: 'Database error' });
        }

        // console.log('Query Result:', result);

        if (!result.length) {
            console.log('Login Failed');
            return res.json({ status: 'error', error: 'Incorrect username or password' });
        }

        const user = result[0];

        // Compare plain text password
        if (password !== user.password) {
            console.log('Login Failed');
            return res.json({ status: 'error', error: 'Incorrect username or password' });
        }

        const token = jwt.sign({ id: user.user_id }, 'secretkeywebtech', {
            expiresIn: '90d'
        });

        const cookieOptions = {
            expiresIn: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        };

        if (user.type === 'student') {
            res.cookie('studentUser', token, cookieOptions);
        } else if (user.type === 'custodian') {
            res.cookie('custodianUser', token, cookieOptions);
        }

        console.log('Login Successful');
        return res.json({ status: 'success', user: { type: user.type }, success: 'user has been logged in' });
    });
};

module.exports = login;
