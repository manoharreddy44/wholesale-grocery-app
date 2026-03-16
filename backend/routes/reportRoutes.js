const express = require('express');
const { getAnalytics } = require('../controllers/reportController');

const router = express.Router();

router.get('/', getAnalytics);

module.exports = router;
