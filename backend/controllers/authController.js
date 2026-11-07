import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const makeToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const safeUser = user => ({ id: user._id, name: user.name, email: user.email });

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};
    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 80 ||
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    )
      return res.status(400).json({ message: "Enter a valid name and email and a password of 8 to 72 bytes." });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail }))
      return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ message: "Incorrect email or password." });
    res.json({ token: makeToken(user._id), user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name } = req.body || {};
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80)
      return res.status(400).json({ message: "Name must contain 2 to 80 characters." });
    const user = await User.findByIdAndUpdate(req.userId, { name: name.trim() }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user: safeUser(user) });
  } catch (e) { next(e); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const user = await User.findById(req.userId).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword || "", user.password)))
      return res.status(400).json({ message: "Current password is incorrect." });
    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      Buffer.byteLength(newPassword, "utf8") > 72
    )
      return res.status(400).json({ message: "New password must contain 8 to 72 bytes." });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (e) { next(e); }
}