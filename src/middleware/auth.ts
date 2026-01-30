import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  
  console.log(`🔐 [AUTH] Vérification du token pour: ${req.method} ${req.path}`);
  console.log(`   Authorization header: ${authHeader ? "✅ Présent" : "❌ Manquant"}`);
  
  if (!authHeader) {
    console.warn(`⚠️  [AUTH] Token manquant`);
    return res.status(401).json({ message: "Token manquant" });
  }

  try {
    // Format: "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.warn(`⚠️  [AUTH] Format de token invalide: ${authHeader.substring(0, 20)}...`);
      return res.status(401).json({ message: "Format de token invalide" });
    }

    const token = parts[1];
    const jwtSecret = process.env.JWT_SECRET || "secretSpendio";
    const decoded = jwt.verify(token, jwtSecret);
    
    req.user = decoded;
    console.log(`✅ [AUTH] Token valide pour l'utilisateur: ${(decoded as any).id || "unknown"}`);
    next();
  } catch (err: any) {
    console.error(`❌ [AUTH] Erreur vérification token:`);
    console.error(`   Message: ${err.message}`);
    console.error(`   Name: ${err.name}`);
    return res.status(401).json({ message: "Token invalide", error: err.message });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Accès réservé à l'administrateur" });
  next();
};
