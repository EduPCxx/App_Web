const profileService = require('../services/profile.service');

const getMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getMyProfile(req.user.id);
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateMyProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data: profile, message: 'Perfil actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateMyProfile };
