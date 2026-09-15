import slugify from 'slugify';

/**
 * Builds a URL-safe slug that is unique within a collection, appending -2, -3…
 * on collision. `excludeId` lets an update keep its own existing slug.
 */
export const uniqueSlug = async (Model, source, excludeId = null) => {
  const base = slugify(source, { lower: true, strict: true }) || 'item';
  let candidate = base;
  let suffix = 1;

  // Collections here are small, so a short probe loop is cheaper and clearer
  // than a regex scan over every near-match.
  while (true) {
    const query = { slug: candidate };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const clash = await Model.exists(query);
    if (!clash) {
      return candidate;
    }
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
};
