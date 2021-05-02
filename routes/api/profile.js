const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.fondOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({ msg: 'There is no user profile found!' });
        }

        res.json(profile);

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});


// @route   POST api/profile
// @desc    create or update profile 
// @access  Private

router.post('/', [auth, [check('status', 'Status is required')
    .not()
    .isEmpty(),
check('skills', 'Skills is required')]],
    async (req, res) => {
        console.log("post user")
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array() });
        }

        const { compnay, website, location, status, skills, bio, githubusername } = req.body;
        const profileFields = {};
        profileFields.user = req.user.id;
        if (compnay) profileFields.compnay = compnay;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        try {
            let profile = await Profile.findOne(
                { user: req.user.id }
            );

            if (profile) {
                //Update profile 
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );
                return res.json(profile);
            }
            // create profile
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

// @route   GET api/profile
// @desc    Get all profile 
// @access  Public
router.get('/', async (req, res) => {
    console.log("get user")
    try {
        const profiles = await Profile.find().populate(
            'user', ['name', 'avatar']
        );
        res.json(profiles);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne(
            { user: req.params.user_id }
        ).populate(
            'user', ['name', 'avatar']
        );

        if (!profile)
            return res.status(400).json({ msg: 'There is no profile' })

        res.json(profile);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Delete profile, user & posts 
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // Remove profile
        // remove users posts
        await Profile.findOneAndRemove({ user: req.user.id });
        // Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'User deleted' });
        res.json(profiles);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile Experience
// @access  Private
router.put('/experience', auth, async (req, res) => {

})
module.exports = router;
