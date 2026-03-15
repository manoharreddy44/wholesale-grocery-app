const express = require('express');
const { getAll, getOne, create, updateStatus } = require('../controllers/orderController');

const router = express.Router();

router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id/status', updateStatus);

module.exports = router;
