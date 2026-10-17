const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        username: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Admin email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Admin password is required"],
            minlength: 6,
        },
        phone: {
            type: String,
            trim: true,
            default: "",
        },
        role: {
            type: String,
            enum: ["admin", "superadmin"],
            default: "admin",
        },
        permissions: {
            type: [String],
            default: [
                "manage_movies",
                "manage_theatres",
                "manage_shows",
                "manage_bookings",
                "view_analytics",
            ],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

adminSchema.pre("validate", function (next) {
    if (!this.name && this.username) this.name = this.username;
    if (!this.username && this.name) this.username = this.name;
    if (!this.name && !this.username) {
        this.invalidate("name", "Admin name or username is required");
    }
    next();
});

module.exports = mongoose.model("Admin", adminSchema);
