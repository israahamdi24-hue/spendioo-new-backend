import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";

/* GET profil */
export const getProfile = async (req: any, res: Response) => {
  const user = await User.findByPk(req.user.id);
  res.json(user);
};

/* UPDATE profil */
export const updateProfile = async (req: any, res: Response) => {
  const { name, email, language, currency, darkMode, notifications } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  user.name = name || user.name;
  user.email = email || user.email;
  user.language = language || user.language;
  user.currency = currency || user.currency;
  user.darkMode = darkMode !== undefined ? darkMode : user.darkMode;
  user.notifications = notifications !== undefined ? notifications : user.notifications;

  await user.save();
  res.json({ message: "Profil mis à jour" });
};

/* CHANGE PASSWORD */
export const changePassword = async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Ancien mot de passe incorrect" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Mot de passe changé" });
};

/* EXPORT DATA */
export const exportData = async (req: any, res: Response) => {
  const user = await User.findByPk(req.user.id);
  res.json({ user });
};

/* DELETE ACCOUNT */
export const deleteAccount = async (req: any, res: Response) => {
  const user = await User.findByPk(req.user.id);

  if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

  await user.delete();
  res.json({ message: "Compte supprimé" });
};
