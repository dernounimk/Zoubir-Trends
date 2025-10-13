import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // 🔥 الحصول على التوكن من الـ header بدلاً من الكوكيز
    let accessToken = req.headers.authorization;

    if (accessToken && accessToken.startsWith('Bearer ')) {
      accessToken = accessToken.substring(7);
    }

    if (!accessToken) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - No access token provided" 
      });
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false,
        message: "Access token expired" 
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false,
        message: "Invalid access token" 
      });
    }
    
    return res.status(500).json({ 
      success: false,
      message: "Authentication error" 
    });
  }
};

export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ 
      success: false,
      message: "Access denied - Admin only" 
    });
  }
};