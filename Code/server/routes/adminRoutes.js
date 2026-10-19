// const express = require("express");
// const router = express.Router();
// module.exports = router;
// server/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");

const JWT_SECRET = process.env.JWT_SECRET || "IMOVIES_SECRET_KEY";

// @route   POST /api/auth/admin/register
// @desc    Register a new admin account
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
        const existingAdmin = await Admin.findOne({ email: normalizedEmail });
        if (existingAdmin) {
            return res.status(409).json({
                status: false,
                msg: "Admin with this email already exists!",
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const admin = await Admin.create({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        const adminDetails = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            isAdmin: true,
        };

        const jwtToken = jwt.sign({ adminDetails, email: admin.email, isAdmin: true }, JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(201).json({
            status: true,
            msg: "Admin Registered Successfully!",
            jwtToken,
            adminDetails,
        });
    } catch (error) {
        next(error);
    }
});

// @route   POST /api/auth/admin/login
// @desc    Authenticate admin & return JWT token
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
        const admin = await Admin.findOne({ email: normalizedEmail });
        if (!admin) {
            return res.status(401).json({
                status: false,
                msg: "Invalid Admin Email or Password!",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                status: false,
                msg: "Invalid Admin Email or Password!",
            });
        }

        const adminDetails = {
            id: admin._id,
            username: admin.username,
            email: admin.email,
            isAdmin: true,
        };

        const jwtToken = jwt.sign({ adminDetails, email: admin.email, isAdmin: true }, JWT_SECRET, {
            expiresIn: "7d",
        });

        return res.status(200).json({
            status: true,
            msg: "Admin Login Successful!",
            jwtToken,
            adminDetails,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;