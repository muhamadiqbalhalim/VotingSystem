export const CATEGORIES = {
  president: { id: 'president', title: 'President', max: 1 },
  deputy: { id: 'deputy', title: 'Deputy President', max: 1 },
  vice: { id: 'vice', title: 'Vice President', max: 1 },
  secretary: { id: 'secretary', title: 'Hon. Secretary', max: 1 },
  treasurer: { id: 'treasurer', title: 'Hon. Treasurer', max: 1 },
  exco: { id: 'exco', title: 'Exco', max: 10 }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export const CATEGORY_IDS = CATEGORY_LIST.map((category) => category.id);

export const LOCKED_CATEGORY = 'locked';

export const isValidCategory = (categoryId) =>
  Object.prototype.hasOwnProperty.call(CATEGORIES, categoryId);
