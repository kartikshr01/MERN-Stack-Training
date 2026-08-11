const { registerUser, loginUser } = require("../services/authService");

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const token = await loginUser(req.body);

    res.cookie("token", token, {
      httpOnly: true,
    });

    res.status(200).json({
      token: token,
      message: "Login Successful",
    });
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "Invalid Email or Password",
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const logout = (req, res) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logout Successful",
  });
};

module.exports = {
  register,
  login,
  logout,
};
