import assert from 'node:assert/strict';
import test from 'node:test';
import { createRecipeSession, appendSession, refineCapturedSession, answerForCapturedSession } from '../src/recipe-workspace.mjs';
import { validateAction } from '../src/response-contract.mjs';
import { getOrCreatePendingRequest } from '../src/request-identity.mjs';

const recipe = (id, title) => ({ id, title, ingredients: ['chickpeas'], instructions: ['Simmer.'] });

test('a late refinement updates the captured card, not the newly active one', () => {
  const sessions = [createRecipeSession('a', recipe('1', 'Stew'), '', ''), createRecipeSession('b', recipe('2', 'Pasta'), '', '')];
  const result = refineCapturedSession(sessions, 'a', recipe('model-generated-id', 'Spicy stew'), 'Spicy please', 'Done');
  assert.equal(result[0].current.title, 'Spicy stew');
  assert.equal(result[0].current.id, '1');
  assert.equal(result[1].current.title, 'Pasta');
  assert.equal(sessions[0].current.title, 'Stew');
});

test('a question records the answer without mutating a recipe', () => {
  const sessions = appendSession([], createRecipeSession('a', recipe('1', 'Stew'), '', ''));
  const result = answerForCapturedSession(sessions, 'a', 'Can I prepare ahead?', 'Yes, refrigerate.');
  assert.deepEqual(result[0].current, sessions[0].current);
  assert.equal(result[0].latestResponse, 'Yes, refrigerate.');
});

test('response action contract distinguishes questions and recipe changes', () => {
  assert.equal(validateAction({ action: 'question', recipe: null, response: 'Yes.', excludedIngredients: [] }), true);
  assert.equal(validateAction({ action: 'question', recipe: recipe('1','Stew'), response: 'Yes.', excludedIngredients: [] }), false);
  assert.equal(validateAction({ action: 'refinement', recipe: null, response: 'Done.', excludedIngredients: [] }), false);
  assert.equal(validateAction({ action: 'new_recipe', recipe: recipe('1','Stew'), response: 'Here.', excludedIngredients: [] }), true);
});

test('only a retry on the same message and captured card keeps identity', () => {
  const first = getOrCreatePendingRequest(null, 'Spicy please', 'a');
  const repeat = getOrCreatePendingRequest(first, 'Spicy please', 'a');
  assert.equal(repeat.idempotencyKey, first.idempotencyKey);
  assert.notEqual(getOrCreatePendingRequest(first, 'Spicy please', 'b').idempotencyKey, first.idempotencyKey);
  assert.notEqual(getOrCreatePendingRequest(first, 'Milder please', 'a').idempotencyKey, first.idempotencyKey);
});
