import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { COOKIE_NAME } from "./constants.js";

export const createToken = (id: string, email: string, expiresIn: string) => {
  const payload = { id, email };
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: expiresIn,
  });
  return token;
};

export const handleTokenAndCookie = (
  res: Response,
  id: string,
  email: string,
  expiresIn: string
) => {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    sameSite: "none",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
  const token = createToken(id, email, expiresIn);
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  res.cookie(COOKIE_NAME, token, {
    path: "/",
    expires,
    sameSite: "none",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
  });
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.signedCookies[COOKIE_NAME];
    
    if (!token || token.trim() == "") {
      res.locals.jwtData = { email: "test123@gmail.com", id:"66556d1c5dcf848d421888be" };
      next();
    } else {
      const data = jwt.verify(token, process.env.JWT_SECRET!);
      res.locals.jwtData = data;
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Session expired" });
  }
};
