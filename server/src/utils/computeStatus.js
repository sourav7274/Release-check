const STEPS = require('../constants/steps');

/**
 * Compute release status from step completion state.
 * - planned: no steps completed
 * - ongoing: at least one step completed (but not all)
 * - done: all steps completed
 */
function computeStatus(stepState) {
  const keys = STEPS.map(s => s.key);
  const completed = keys.filter(k => stepState[k] === true).length;

  if (completed === 0) return 'planned';
  if (completed === keys.length) return 'done';
  return 'ongoing';
}

/**
 * Build the default step state object with all steps set to false.
 */
function getDefaultStepState() {
  const state = {};
  STEPS.forEach(s => {
    state[s.key] = false;
  });
  return state;
}

module.exports = { computeStatus, getDefaultStepState };
