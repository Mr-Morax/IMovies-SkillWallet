// const express = require("express");
// const router = express.Router();
// module.exports = router;
// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const fetchUser = require("../middlewares/fetchUser");

const JWT_SECRET = process.env.JWT_SECRET || "IMOVIES_SECRET_KEY";

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                status: false,
                msg: "Please provide username, email, and password.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                msg: "User with this email already exists!",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        const userDetails = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        const jwtToken = jwt.sign({ userDetails, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(201).json({
            status: true,
            msg: "User Registered Successfully!",
            jwtToken,
            userDetails,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: false,
                msg: "Please provide both email and password.",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                status: false,
                msg: "Invalid Email or Password!",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                msg: "Invalid Email or Password!",
            });
        }

        const userDetails = {
            id: user._id,
            username: user.username,
            email: user.email,
        };

        const jwtToken = jwt.sign({ userDetails, email: user.email }, JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(200).json({
            status: true,
            msg: "Login Successful!",
            jwtToken,
            userDetails,
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/auth/getuser
// @desc    Get logged-in user profile details
// @access  Private (requires fetchUser middleware)
router.get("/getuser", fetchUser, async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.user.email }).select("-password");
        if (!user) {
            return res.status(404).json({
                status: false,
                msg: "User not found!",
            });
        }
        return res.status(200).json({
            status: true,
            user,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;