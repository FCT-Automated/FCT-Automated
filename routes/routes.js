const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');

router.get(
    '/currency',
    controller.getCurrency,
  );

module.exports = router;
