const AppError = require('./AppError');

const STATUSES = ['pending', 'processing', 'published', 'finished', 'cancelled'];
const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['published', 'cancelled'],
  published: ['finished', 'cancelled'],
  finished: [],
  cancelled: []
};

const assertStatusTransition = (current, next) => {
  if (current === next) return;
  const allowed = STATUS_TRANSITIONS[current] || [];
  if (!allowed.includes(next)) {
    const destinations = allowed.length ? allowed.join(', ') : 'ninguno';
    throw new AppError(
      `No se puede cambiar el estado de "${current}" a "${next}". Estados permitidos: ${destinations}`,
      422,
      'INVALID_STATUS_TRANSITION'
    );
  }
};

module.exports = { STATUSES, STATUS_TRANSITIONS, assertStatusTransition };
