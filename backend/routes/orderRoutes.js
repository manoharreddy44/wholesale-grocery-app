const express = require('express');
const { getAll, getOne, getOrdersByCustomer, create, updateStatus } = require('../controllers/orderController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAll);
router.get('/customer/:id', getOrdersByCustomer);
router.get('/:id', getOne);
router.post('/', optionalAuth, create);
router.patch('/:id/status', updateStatus);

module.exports = router;
