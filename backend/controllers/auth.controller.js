import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// توليد Access Token
const generateAccessToken = (userId) => {
	return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
};

// توليد Refresh Token
const generateRefreshToken = (userId) => {
	return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});
};

export const login = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });
	if (!user) {
		res.status(401);
		throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
	}

	const isPasswordCorrect = await bcrypt.compare(password, user.password);
	if (!isPasswordCorrect) {
		res.status(401);
		throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
	}

	const accessToken = generateAccessToken(user._id);
	const refreshToken = generateRefreshToken(user._id);

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 15 * 60 * 1000,
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		maxAge: 7 * 24 * 60 * 60 * 1000,
	});

	res.json({
		message: "تم تسجيل الدخول بنجاح",
		user: {
			id: user._id,
			fullName: user.fullName,
			email: user.email,
		},
	});
});

// تجديد التوكن
export const refreshAccessToken = asyncHandler(async (req, res) => {
	const token = req.cookies.refreshToken;

	if (!token) {
		res.status(401);
		throw new Error("Refresh Token غير موجود");
	}

	try {
		const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

		const newAccessToken = generateAccessToken(decoded.userId);
		res.cookie("accessToken", newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "تم تجديد التوكن" });
	} catch (err) {
		res.status(403);
		throw new Error("توكن غير صالح أو منتهي");
	}
});

// تسجيل الخروج
export const logout = asyncHandler(async (req, res) => {
	// لا حاجة لحذف من Redis
	res.clearCookie("accessToken");
	res.clearCookie("refreshToken");

	res.json({ message: "تم تسجيل الخروج بنجاح" });
});

// الملف الشخصي
export const getProfile = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select("-password");
	res.json(user);
});
