const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Name is required and must be a non-empty string"
      });
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Email is required and must be a non-empty string"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        status: "error",
        message: "Please provide a valid email address"
      });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        status: "error",
        message: "Password is required and must be at least 6 characters long"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "A user with this email already exists"
      });
    }

    if (role && typeof role === "string") {
      const normalizedRole = role.trim().toUpperCase();
      if (normalizedRole !== "CUSTOMER") {
        return res.status(403).json({
          status: "error",
          message: "Public registration is limited to customer accounts"
        });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "CUSTOMER"
      }
    });

    const token = generateToken(user);

    return res.status(201).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        status: "error",
        message: "A user with this email already exists"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to register user: " + error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Email is required"
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        status: "error",
        message: "Password is required"
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to login: " + error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    return res.status(200).json({
      status: "success",
      data: user
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch profile: " + error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
