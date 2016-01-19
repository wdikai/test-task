var express = require('express');
var user = require('../controllers/userController');
var authorization = require('../middleware/authorization');
var router = express.Router();

router.get('/me' , authorization, user.getMe);
router.put('/me' , authorization, user.updateMe);
router.get('/user/:id' , authorization, user.getUserById);
router.get('/user' , authorization, user.searchUser);

module.exports = router;