import User from "../../models/Users.js";
import { hashSync, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "../../models/LoginAttempt.js";
import { incrementFailedAttempt } from "../../utils.js";
import { getClientIP } from "../../config/client-ip.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, businessName, userType, avatar, password, rememberMe } = req.body;

    if (!name || !email) {
      console.log("Name or email is missing");
      return res.status(400).json({
        message: "Name and email are required fields.",
      });
    }

    if (!password || password.length < 8) {
      console.log("Password is missing or too short");
      return res.status(400).json({
        message: "Password must be at least 8 characters long.",
      });
    }

    if (email.length >= 50) {
      console.log("Email is too long");
      return res.status(400).json({
        message: `Email must be less than 50 characters. Current length is ${email.length}`,
      });
    }

    // Check if user with the provided email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log("User with the provided email already exists");
      return res.status(400).json({
        message: "User with the provided email already exists.",
      });
    }

    // Check if user with the provided name exists
    const existingName = await User.findOne({ name });
    if (existingName) {
      console.log("User with the provided name already exists");
      return res.status(400).json({
        message: "User with the provided name already exists.",
      });
    }

    // Hash the password
    const hashedPassword = hashSync(password, 10);

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      businessName,
      userType,
      avatar,
      isActivated: true,
    });

    // Save the new user to the database
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.userType },
      process.env.SECRET
    );

    res.cookie("access_token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24, // 1 week or 1 day
    });

    return res.status(201).json({
      message: "User Created Successfully",
      token,
      userID: newUser._id,
      user: newUser, // send the created user
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      message: "Internal Server Error. Please try again later.",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = getClientIP(req);

    let attempt = await LoginAttempt.findOne({ ip: ipAddress });

    if (!attempt) {
      attempt = new LoginAttempt({ ip: ipAddress });
    } else {
      if (Date.now() - attempt.lastAttempt > 2 * 60 * 1000) {
        attempt.count = 0;
      }
      attempt.lastAttempt = Date.now();
    }

    if (attempt.blockedUntil && Date.now() < attempt.blockedUntil) {
      return res.status(400).json({
        message: `Too many failed login attempts. Try again after ${new Date(
          attempt.blockedUntil
        ).toLocaleTimeString()}`,
      });
    }
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required fields." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return await incrementFailedAttempt(
        attempt,
        res,
        "Email or password is incorrect"
      );
    }

    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return await incrementFailedAttempt(
        attempt,
        res,
        "Email or password is incorrect"
      );
    }

    await LoginAttempt.deleteOne({ ip: ipAddress });
    const maskedEmail = user.email.replace(
      /^(.)(.*)(@.*)$/,
      (_, first, middle, domain) => {
        return first + "*".repeat(middle.length) + domain;
      }
    );

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.SECRET
    );
    res.cookie("access_token", token, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24, // 1 day
    });

    return res.json({ token, UserID: user._id,user });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(201)
      .json({ message: "Internal Server Error. Please Try again later." });
  }
};


export const logout = async (req, res) => {
  try {
    // Clear the auth cookie with secure options
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });
    
    // Invalidate the session if you're using one
    if (req.session) {
      req.session.destroy();
    }
    
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500) // Using correct 500 status for server errors
      .json({ success: false, message: "Internal Server Error. Please try again later." });
  }
};
