const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.post('/issue', transactionController.issueBook);
router.post('/request', transactionController.requestBook);
router.put('/approve/:id', transactionController.approveRequest);
router.put('/reject/:id', transactionController.rejectRequest);
router.put('/return/:id', transactionController.returnBook);
router.get('/student/:memberId', transactionController.getStudentTransactions);

module.exports = router;
