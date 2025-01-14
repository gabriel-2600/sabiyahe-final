const logoutCustodian =  (req, res) =>  {
    res.clearCookie('custodianUser');
    res.redirect('/login');
}
module.exports = logoutCustodian;