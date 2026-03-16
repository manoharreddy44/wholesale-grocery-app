const express = require('express');
const { addPayment, getPayments } = require('../controllers/paymentController');

const router = express.Router();

router.get('/', getPayments);
router.post('/', addPayment);

module.exports = router;
