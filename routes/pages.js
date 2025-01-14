const express = require('express');
const router = express.Router();

const loggedIn = require('../controllers/student/studAuthFolder/loggedin');
const logout = require('../controllers/student/studAuthFolder/logout');

const loggedinCustodian = require('../controllers/custodian/authFolder/loggedinCustodian')
const logoutCustodian = require('../controllers/custodian/authFolder/logoutCustodian')


// Student Routes
// Authentication
router.get('/student', loggedIn, (req, res) => {
    if(req.user){
        // console.log(req.user);
        res.render('studentHome', { status: 'loggedIn', user: req.user });
    } else {
        res.render('studentHome', { status: 'no', user: 'nothing' });
    }
})

router.get('/register', (req, res) => {
    res.sendFile('register.html', { root:'./public' });
});

router.get('/login', (req, res) => {
    res.sendFile('login.html', { root:'./public' });
});

router.get('/logout', logout);


// Custodian Routes
router.get('/custodian', loggedinCustodian, (req, res) => {
    if(req.custodianUser) {
        res.render('custodianHome', { status: 'loggedInCustodian', user: req.custodianUser });
    } else {
        res.render('custodianHome', { status: 'no', user: 'nothing' });
    }
});

// router.get('/loginCustodian', (req, res) => {
//     res.sendFile('loginCustodian.html', { root: './public'});
// })

router.get('/logoutCustodian', logoutCustodian);

module.exports = router;