const { z } = require('zod');

const login = z.object({
  body: z.object({
    email: z.string().trim().email('El correo electrónico no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128)
  })
});

module.exports = { login };
