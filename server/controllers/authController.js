const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const allowedRoles = ["sender", "receiver", "driver", "truck_owner"];

const toSafeUser = (user) => ({
    id: user._id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    role: user.role,
    companyName: user.companyName,
    truckNumber: user.truckNumber,
    deliveryAddress: user.deliveryAddress,
    city: user.city,
    postalCode: user.postalCode
});

const signup = async (req, res) => {
    try {
        const body = req.body || {};
        const { name, phone, email, password, role } = body;
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (typeof name !== "string" || !name.trim() || typeof phone !== "string" || !phone.trim() || !normalizedEmail || !password || !role) {
            return res.status(400).json({ message: "Name, phone, email, password and role are required" });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ message: "Enter a valid email address" });
        }
        if (typeof password !== "string" || password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid account role" });
        }
        if (body.companyName != null && typeof body.companyName !== "string") {
            return res.status(400).json({ message: "Company name must be a string" });
        }
        if (body.truckNumber != null && typeof body.truckNumber !== "string") {
            return res.status(400).json({ message: "Truck number must be a string" });
        }
        if (await User.exists({ email: normalizedEmail })) {
            return res.status(409).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            phone: phone.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            companyName: ["sender", "truck_owner"].includes(role) ? body.companyName?.trim() : undefined,
            truckNumber: role === "driver" ? body.truckNumber?.trim() : undefined
        });

        return res.status(201).json({
            message: "Account created successfully",
            user: toSafeUser(user)
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Signup details are invalid" });
        }
        return res.status(500).json({ message: "Unable to create account" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password, role } = req.body || {};
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

        if (!normalizedEmail || typeof password !== "string" || !password || !role) {
            return res.status(400).json({ message: "Email, password and role are required" });
        }
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid account role" });
        }

        const user = await User.findOne({ email: normalizedEmail }).select("+tokenVersion");
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }
        if (user.role !== role) {
            return res.status(403).json({ message: "Selected role does not match your account" });
        }
        if (!process.env.JWT_SECRET) {
            return res.status(503).json({ message: "Authentication is not configured on the server" });
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role, tokenVersion: user.tokenVersion || 0 },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            message: "Login successful",
            token,
            user: toSafeUser(user)
        });
    } catch {
        return res.status(500).json({ message: "Unable to log in" });
    }
};

const logout = async (req, res) => {
    try {
        await User.updateOne({ _id: req.user.id }, { $inc: { tokenVersion: 1 } });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch {
        return res.status(500).json({ message: "Unable to log out" });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "Account not found" });
        return res.status(200).json({ user: toSafeUser(user) });
    } catch {
        return res.status(400).json({ message: "Invalid account identifier" });
    }
};

const updateProfile = async (req, res) => {
    try {
        const updates = {};
        const commonFields = ["name", "phone"];
        const roleFields = {
            receiver: ["deliveryAddress", "city", "postalCode"],
            sender: ["companyName"],
            truck_owner: ["companyName"],
            driver: ["truckNumber"]
        };
        const optionalFields = roleFields[req.user.role] || [];

        const body = req.body || {};
        for (const field of [...commonFields, ...optionalFields]) {
            if (Object.hasOwn(body, field)) {
                if (typeof body[field] !== "string" || (commonFields.includes(field) && !body[field].trim())) {
                    return res.status(400).json({ message: `${field} must be a non-empty string` });
                }
                updates[field] = body[field].trim();
            }
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No permitted profile fields provided" });
        }

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, {
            returnDocument: "after",
            runValidators: true
        }).select("-password");
        if (!user) return res.status(404).json({ message: "Account not found" });
        return res.status(200).json({ message: "Profile updated", user: toSafeUser(user) });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Profile details are invalid" });
        }
        return res.status(500).json({ message: "Unable to update profile" });
    }
};

module.exports = { signup, login, logout, getProfile, updateProfile };