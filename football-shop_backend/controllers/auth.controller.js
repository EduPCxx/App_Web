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

const logout = async (req, res, next) => {
  try {
    const result = await authService.logout({
      userId: req.user?.id,
      token: req.token,
      expiresAt: req.tokenPayload?.exp ? new Date(req.tokenPayload.exp * 1000) : null,
      reason: 'logout'
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const result = await authService.logoutAll({
      userId: req.user?.id,
      token: req.token,
      expiresAt: req.tokenPayload?.exp ? new Date(req.tokenPayload.exp * 1000) : null
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, logout, logoutAll };
