var express = require('express');
var multer = require('multer');
var crypt = require('crypto');
var item = require('../controllers/itemController');
var authorization = require('../middleware/authorization');
var router = express.Router();

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/../public/uploads/');
    },
    filename: function (req, file, cb) {
        var shasum = crypt
            .createHash('sha1')
            .update(file.fieldname)
            .update(file.originalname)
            .update(file.encoding)
            .update(file.mimetype)
            .update('' + file.size)
            .update('' + Date.now())
        var temp = shasum.digest('base64');
        
        var name = temp.replace(new RegExp("/", 'g'), "-");
        console.log(name);
        cb(null, name + '' + '.png');
    }
});
var upload = multer({ storage: storage });

router.get('/item', authorization, item.findItem);
router.post('/item', authorization, item.createItem);
router.get('/item/:id', authorization, item.getItemById);
router.put('/item/:id', authorization, item.updateItem);
router.delete('/item/:id', authorization, item.dropItem);
router.post('/item/:id/image', [authorization,  upload.array('file')], item.uploadImage);
router.delete('/item/:id/image', authorization, item.dropImage);

module.exports = router;