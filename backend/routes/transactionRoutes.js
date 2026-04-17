const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.post('/issue', transactionController.issueBook);
router.put('/return/:id', transactionController.returnBook);

module.exports = router;
