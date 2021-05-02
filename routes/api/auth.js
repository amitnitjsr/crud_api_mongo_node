const express = require('express');
const router = express.Router();

// @route   GET api/auth
// @desc    Tests post route
// @access  Public
router.get('/', (req, res) => res.json({ msg: 'Auth Works' }));

module.exports = router;
