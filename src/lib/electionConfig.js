export const CATEGORIES = {
  // Jawatan Utama
  president: { id: 'president', title: 'Pengerusi / Presiden', max: 1 },
  deputy: { id: 'deputy', title: 'Timbalan Pengerusi / Timbalan Presiden', max: 1 },
  vice: { id: 'vice', title: 'Naib Pengerusi / Naib Presiden', max: 1 },
  secretary: { id: 'secretary', title: 'Setiausaha', max: 1 },
  assistant_secretary: { id: 'assistant_secretary', title: 'Penolong Setiausaha', max: 1 },
  treasurer: { id: 'treasurer', title: 'Bendahari', max: 1 },
  assistant_treasurer: { id: 'assistant_treasurer', title: 'Penolong Bendahari', max: 1 },
  
  // Jawatankuasa Kerja
  exco1: { id: 'exco1', title: 'Ahli Jawatankuasa (AJK) 1', max: 1 },
  exco2: { id: 'exco2', title: 'Ahli Jawatankuasa (AJK) 2', max: 1 },
  exco3: { id: 'exco3', title: 'Ahli Jawatankuasa (AJK) 3', max: 1 }
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
export const CATEGORY_IDS = CATEGORY_LIST.map((category) => category.id);
export const LOCKED_CATEGORY = 'locked';
export const EXCO_POOL_CATEGORY = 'exco';

export const getCandidateGroupKey = (categoryId) =>
  categoryId?.toString().startsWith('exco') ? EXCO_POOL_CATEGORY : categoryId;

export const isValidCategory = (categoryId) =>
  Object.prototype.hasOwnProperty.call(CATEGORIES, categoryId);