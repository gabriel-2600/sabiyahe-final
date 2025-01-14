const express = require('express');
const router = express.Router();

const login = require('./login');
const register = require('../student/studAuthFolder/register');

router.post('/register', register);
router.post('/login', login);

module.exports = router;