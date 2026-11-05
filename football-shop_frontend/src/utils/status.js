const statuses = ['pending', 'processing', 'published', 'finished', 'cancelled'];
const legacyStatuses = {
  draft: 'pending',
  active: 'published',
  archived: 'finished',
  suspended: 'cancelled'
};

export const normalizeStatus = (status) => {
  const normalized = legacyStatuses[status] || status;
  return statuses.includes(normalized) ? normalized : 'pending';
};
