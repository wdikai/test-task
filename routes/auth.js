var express = require('express');
var auth = require('../controllers/authContoller');
var router = express.Router();

router.post('/login' , auth.login);
router.post('/register' , auth.registration);

module.exports = router;