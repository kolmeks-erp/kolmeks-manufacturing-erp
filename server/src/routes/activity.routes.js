const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

router.use(authenticateUser);

router.get('/', (req, res, next) => activityController.getActivity(req, res, next));

module.exports = router;
