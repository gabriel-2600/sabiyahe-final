const db = require('../../../routes/db-config');

const register = async (req, res) => {
    const { email, username, password: Npassword, fullname } = req.body;

    if (!email || !username || !Npassword || !fullname) {
        return res.json({ status: 'error', error: 'Please enter full name, password, username or email' });
    } else {
        db.query('SELECT username, email FROM users WHERE username = ? OR email = ?', [username, email], async (err, result) => {
            if (err) throw err;

            if (result[0]) {
                return res.json({ status: 'error', error: 'Username or email is already registered' });
            } else {
                db.query('INSERT INTO users SET ?', { username: username, email: email, password: Npassword, full_name: fullname }, (error, results) => {
                    if (error) throw error;
                    return res.json({ status: 'success', success: 'Registered successfully' });
                });
            }
        });
    }
};

module.exports = register;
