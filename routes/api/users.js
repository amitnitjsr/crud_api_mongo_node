const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const passport = require('passport');
const auth = require('../../middleware/auth');

const User = require('../../models/User');

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            // const avatar = gravatar.url(req.body.email, {
            //     s: '200', // Size
            //     r: 'pg', // Rating
            //     d: 'mm' // Default
            // });

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                // avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});


// @route   POST api/users
// @desc    Register user
// @access  Public
router.post('/', [
    check('name', 'Name is required')
        .not()
        .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
        // See if user exists
        let user = await User.findOne({ email });
        if (user) {
            res.status(400).json({ errors: [{ msg: 'User Already exists' }] });
        }
        // Get user gravatar
        // const avatar = gravatar.url(email, {
        //     s: '200',
        //     r: 'pg',
        //     d: 'mm'
        // });

        user = new User({
            name, email,
            // avatar,
            password,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        // Encrypt password
        const payload = {
            user: {
                id: user.id,

            }
        }

        jwt.sign(payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/users
// @desc    Get all users 
// @access  Public
router.get('/', async (req, res) => {
    console.log("get user")
    try {
        const user = await User.find().populate(
            'user'
        );
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   Update api/users
// @desc    Updates users 
// @access  Public
router.put('/', async (req, res) => {
    const { name, email, id } = req.body;

    const userFields = {};
    userFields.user = id;
    if (name) userFields.name = name;
    if (email) userFields.email = email;

    try {
        let user = await User.findOne(
            { _id: id }
        );
        if (user) {
            //Update user 
            user = await User.findOneAndUpdate(
                { _id: id },
                { $set: userFields },
                { new: true }
            );
            return res.json(user);
        }
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/users
// @desc    Delete User
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        console.log('res', req.body.id)
        await User.findOneAndRemove({ user: req.body.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.body.id });
        // get user
        const user = await User.find().populate(
            'user'
        );
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }).then(user => {
        // Check for user
        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }

        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User Matched
                const payload = { id: user.id, name: user.name, avatar: user.avatar }; // Create JWT Payload

                // Sign Token
                jwt.sign(
                    payload,
                    config.get('jwtSecret'),
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    }
                );
            } else {
                errors.password = 'Password incorrect';
                return res.status(400).json(errors);
            }
        });
    });
});

// @route   GET api/users/current
// @desc    Return current user
// @access  Private
router.get(
    '/current',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);

module.exports = router;
