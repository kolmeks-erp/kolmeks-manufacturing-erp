const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use(authenticateUser);

router.get('/', (req, res, next) => searchController.search(req, res, next));

module.exports = router;
