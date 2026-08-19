const staffService = require("../services/staffService");

const register = async (req, res, next) => {
  try {
    const userData = await staffService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user_info: userData,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const token = await staffService.login(req.body);

    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
      });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "Staff details fetched successfully",
      user_info: {
        name: user.name,
        email: user.email,
        department: user.department,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  me,
};
