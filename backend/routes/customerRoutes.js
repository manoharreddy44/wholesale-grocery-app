const express = require('express');
const {
  getAll,
  getOne,
  getMe,
  create,
  update,
  remove
} = require('../controllers/customerController');
const { auth, requireCustomer } = require('../middleware/auth');

const router = express.Router();

router.get('/me', auth, requireCustomer, getMe);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
