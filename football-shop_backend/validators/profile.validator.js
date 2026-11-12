const { z } = require('zod');

const profileFields = {
  full_name: z.string().trim().max(150).optional(),
  bio: z.string().trim().max(500).optional(),
  avatar_url: z.string().trim().url('La URL del avatar no es válida').optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(250).optional()
};

const getMyProfile = z.object({});
const updateMyProfile = z.object({
  body: z.object(profileFields).refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar el perfil'
  })
});

module.exports = { getMyProfile, updateMyProfile };
