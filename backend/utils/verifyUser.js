import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/userModel.js";

export const verifyToken = async (req, res, next) => {
  let token = null;
  let refreshTokenVal = null;

  if (req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length > 1) {
      const tokenPart = parts[1];
      if (tokenPart.includes(",")) {
        refreshTokenVal = tokenPart.split(",")[0];
        token = tokenPart.split(",")[1];
      } else {
        token = tokenPart;
      }
    }
  }

  // Fallback to query param (e.g. for secure media/document streaming in <img> or <iframe>)
  if (!token && req.query.token) {
    token = req.query.token;
  }

  // Fallback to cookies
  if (!token && req.cookies?.access_token) {
    token = req.cookies.access_token;
  }
  if (!refreshTokenVal && req.cookies?.refresh_token) {
    refreshTokenVal = req.cookies.refresh_token;
  }

  if (!token && !refreshTokenVal) {
    return next(errorHandler(401, "Authentication required. Please sign in."));
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.user = decoded.id || decoded._id || decoded;
      return next();
    } catch (error) {
      if (error.name !== "TokenExpiredError" || !refreshTokenVal) {
        return next(errorHandler(403, "Invalid or expired access token."));
      }
    }
  }

  // Handle refresh token if access token is absent or expired
  if (refreshTokenVal) {
    try {
      const decodedRefresh = jwt.verify(refreshTokenVal, process.env.REFRESH_TOKEN);
      const user = await User.findById(decodedRefresh.id);

      if (!user) return next(errorHandler(403, "Invalid refresh token: User not found."));
      if (user.refreshToken && user.refreshToken !== refreshTokenVal) {
        return next(errorHandler(403, "Invalid refresh token: Session invalidated."));
      }

      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN,
        { expiresIn: "7d" }
      );

      await User.updateOne(
        { _id: user._id },
        { refreshToken: newRefreshToken }
      );

      res.setHeader("x-access-token", newAccessToken);
      res.setHeader("x-refresh-token", newRefreshToken);

      req.user = user._id;
      return next();
    } catch (error) {
      return next(errorHandler(403, "Refresh token verification failed."));
    }
  }

  return next(errorHandler(401, "Authentication failed."));
};

export const verifyAdmin = async (req, res, next) => {
  verifyToken(req, res, async (err) => {
    if (err) return next(err);
    try {
      const userId = typeof req.user === "object" ? req.user.id || req.user._id : req.user;
      const user = await User.findById(userId);
      if (!user || !user.isAdmin) {
        return next(errorHandler(403, "Access denied. Administrator privileges required."));
      }
      req.adminUser = user;
      next();
    } catch (error) {
      next(error);
    }
  });
};
