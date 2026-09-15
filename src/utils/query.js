/**
 * Turns `?search=` into a case-insensitive OR across the given fields. Escapes
 * the input so a user typing `.*` can't build an expensive or surprising regex.
 */
export const buildSearch = (search, fields) => {
  const term = (search || '').trim();
  if (!term || fields.length === 0) {
    return null;
  }
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(safe, 'i');
  return { $or: fields.map((field) => ({ [field]: pattern })) };
};

/**
 * Whitelists `?sort=` against known keys so clients can't sort on arbitrary
 * unindexed paths.
 */
export const buildSort = (sort, allowed, fallback) => {
  if (!sort) return fallback;
  const desc = sort.startsWith('-');
  const key = desc ? sort.slice(1) : sort;
  if (!allowed.includes(key)) return fallback;
  return { [key]: desc ? -1 : 1 };
};

export const isAdmin = (req) => Boolean(req.user);
