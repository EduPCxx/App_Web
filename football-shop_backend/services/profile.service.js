const profileRepository = require('../repositories/profile.repository');

const getMyProfile = async (userId) => {
  const profile = await profileRepository.findByUserId(userId);
  if (profile) return profile;

  return profileRepository.upsertByUserId(userId, {
    full_name: '',
    bio: '',
    avatar_url: '',
    phone: '',
    address: ''
  });
};

const updateMyProfile = async (userId, payload) =>
  profileRepository.upsertByUserId(userId, payload);

module.exports = { getMyProfile, updateMyProfile };
