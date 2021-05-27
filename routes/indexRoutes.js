const { Router } = require('express');
const indexController = require('../controllers/indexController');

const router = Router();

router.get('/', indexController.home_get);
router.get('/sebaran', indexController.maps_get);
router.get('/info', indexController.info_get);
router.get('/news', indexController.news_get);
router.get('/download', indexController.download_get);


module.exports = router