const logout =  (req, res) =>  {
    res.clearCookie('studentUser');
    res.redirect('/login');
}
module.exports = logout;