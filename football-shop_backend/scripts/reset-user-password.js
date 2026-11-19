require('dotenv').config();

const { StringDecoder } = require('string_decoder');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/user.model');
const { hashPassword } = require('../utils/passwd');

const readHidden = (prompt) => new Promise((resolve, reject) => {
  const { stdin, stdout } = process;
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    reject(new Error('Este comando necesita una terminal interactiva para ocultar la contraseña.'));
    return;
  }

  const decoder = new StringDecoder('utf8');
  let value = '';
  let finished = false;

  const finish = (error) => {
    if (finished) return;
    finished = true;
    stdin.setRawMode(false);
    stdin.pause();
    stdin.removeListener('data', onData);
    stdout.write('\n');
    if (error) reject(error);
    else resolve(value);
  };

  const onData = (chunk) => {
    const input = decoder.write(chunk);
    for (const character of input) {
      if (character === '\u0003' || character === '\u0004') {
        finish(new Error('Operación cancelada.'));
        return;
      }
      if (character === '\r' || character === '\n') {
        finish();
        return;
      }
      if (character === '\u0008' || character === '\u007f') {
        value = Array.from(value).slice(0, -1).join('');
      } else if (character >= ' ') {
        value += character;
      }
    }
  };

  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.on('data', onData);
});

const main = async () => {
  const email = String(process.argv[2] || 'cliente@example.test').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('El correo indicado no es válido.');
  }

  await connectDB();

  const user = await User.findOne({ email }).select('+password_hash');
  if (!user) {
    throw new Error(`No existe una cuenta con el correo ${email}.`);
  }

  const password = await readHidden('Nueva contraseña (mínimo 8 caracteres): ');
  const confirmation = await readHidden('Repite la nueva contraseña: ');
  if (password.length < 8 || password.length > 128) {
    throw new Error('La contraseña debe tener entre 8 y 128 caracteres.');
  }
  if (password !== confirmation) {
    throw new Error('Las contraseñas no coinciden.');
  }

  user.password_hash = await hashPassword(password);
  await user.save();
  console.log(`Contraseña restablecida para ${email}. La cuenta y sus datos no se han modificado.`);
};

main()
  .catch((error) => {
    console.error('No se pudo restablecer la contraseña:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
