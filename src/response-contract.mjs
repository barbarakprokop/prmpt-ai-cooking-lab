/**
 * Standalone adaptation of the app's response validation contract.
 * This demonstration is intentionally narrower than production validation.
 */
const nonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

function isRecipe(value) {
  return !!value && typeof value === 'object'
    && nonEmptyString(value.id)
    && nonEmptyString(value.title)
    && Array.isArray(value.ingredients)
    && value.ingredients.length > 0
    && value.ingredients.every(nonEmptyString)
    && Array.isArray(value.instructions)
    && value.instructions.length > 0
    && value.instructions.every(nonEmptyString);
}

export function validateAction(value) {
  if (!value || typeof value !== 'object') return false;
  if (!['new_recipe', 'refinement', 'question'].includes(value.action)) return false;
  if (!nonEmptyString(value.response)) return false;
  if (!Array.isArray(value.excludedIngredients) || value.excludedIngredients.length > 20 || !value.excludedIngredients.every(nonEmptyString)) return false;
  if (value.action === 'question') return value.recipe === null;
  return isRecipe(value.recipe);
}
