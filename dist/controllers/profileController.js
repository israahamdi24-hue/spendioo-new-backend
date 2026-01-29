"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.exportData = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = __importDefault(require("../models/User"));
/* GET profil */
const getProfile = async (req, res) => {
    const user = await User_1.default.findByPk(req.user.id);
    res.json(user);
};
exports.getProfile = getProfile;
/* UPDATE profil */
const updateProfile = async (req, res) => {
    const { name, email, language, currency, darkMode, notifications } = req.body;
    const user = await User_1.default.findByPk(req.user.id);
    if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    user.name = name || user.name;
    user.email = email || user.email;
    user.language = language || user.language;
    user.currency = currency || user.currency;
    user.darkMode = darkMode !== undefined ? darkMode : user.darkMode;
    user.notifications = notifications !== undefined ? notifications : user.notifications;
    await user.save();
    res.json({ message: "Profil mis à jour" });
};
exports.updateProfile = updateProfile;
/* CHANGE PASSWORD */
const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User_1.default.findByPk(req.user.id);
    if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isMatch)
        return res.status(400).json({ message: "Ancien mot de passe incorrect" });
    user.password = await bcryptjs_1.default.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Mot de passe changé" });
};
exports.changePassword = changePassword;
/* EXPORT DATA */
const exportData = async (req, res) => {
    const user = await User_1.default.findByPk(req.user.id);
    res.json({ user });
};
exports.exportData = exportData;
/* DELETE ACCOUNT */
const deleteAccount = async (req, res) => {
    const user = await User_1.default.findByPk(req.user.id);
    if (!user)
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.delete();
    res.json({ message: "Compte supprimé" });
};
exports.deleteAccount = deleteAccount;
