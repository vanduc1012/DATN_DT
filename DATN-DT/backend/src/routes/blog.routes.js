const express = require('express');
const router = express.Router();

const { authUser, authAdmin } = require('../auth/checkAuth');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/blogs');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const controllerBlog = require('../controller/blog.controller');

router.post('/upload-image', authAdmin, upload.single('image'), controllerBlog.uploadImage);
router.post('/create', authAdmin, controllerBlog.createBlog);
router.get('/get-all', controllerBlog.getAllBlog);
router.post('/update/:id', authAdmin, controllerBlog.updateBlog);
router.delete('/delete/:id', authAdmin, controllerBlog.deleteBlog);
router.get('/get-by-id', controllerBlog.getBlogById);

module.exports = router;
