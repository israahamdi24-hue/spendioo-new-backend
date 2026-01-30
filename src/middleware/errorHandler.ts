import { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  
  console.error(`\n❌ [ERROR HANDLER] ${timestamp}`);
  console.error(`  Route: ${req.method} ${req.path}`);
  console.error(`  IP: ${req.ip}`);
  console.error(`  Message: ${err.message}`);
  console.error(`  Code: ${err.code}`);
  console.error(`  Stack:\n${err.stack}\n`);
  
  res.status(500).json({ 
    message: "Erreur interne du serveur", 
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
    timestamp
  });
};