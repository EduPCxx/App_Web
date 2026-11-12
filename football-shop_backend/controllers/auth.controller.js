const authService = require('../services/auth.service');

const login = async (req, res, next) => {
  try {
    const { token, user } = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: { token, user },
      message: 'Inicio de sesión correcto'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
