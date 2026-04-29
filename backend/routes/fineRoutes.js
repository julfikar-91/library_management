const express = require('express');
const router = express.Router();
const fineController = require('../controllers/fineController');

router.get('/config', fineController.getFineConfig);
router.post('/config', fineController.updateFineConfig);
router.put('/transaction/:id', fineController.updateTransactionFine);

module.exports = router;
