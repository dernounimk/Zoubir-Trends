import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const getCookieOptions = (maxAge = null) => {
  const options = {
    httpOnly: true,
    secure: true, // 🔥 يجب أن يكون true في الإنتاج
    sameSite: 'none', // 🔥 مهم لجميع المتصفحات
    path: '/',
    domain: '.onrender.com' // 🔥 أضف هذا السطر
  };
  
  if (maxAge) options.maxAge = maxAge;
  return options;
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email and password required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    await User.updateOne(
      { _id: user._id },
      { $set: { refreshToken } }
    );

    // إرسال الكوكيز
    res.cookie("accessToken", accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie("refreshToken", refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during login" 
    });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      } catch (error) {
        console.log("Error clearing refresh token:", error.message);
      }
    }

    res.clearCookie("accessToken", getCookieOptions());
    res.clearCookie("refreshToken", getCookieOptions());

    return res.json({ 
      success: true,
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error during logout" 
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No refresh token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ 
        success: false,
        message: "Invalid refresh token" 
      });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, getCookieOptions(15 * 60 * 1000));

    return res.json({ 
      success: true,
      message: "Token refreshed" 
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ 
      success: false,
      message: "Invalid or expired refresh token" 
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authenticated" 
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};