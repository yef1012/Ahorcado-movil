let sequence = 0;

// Identificador local, sin finalidad criptográfica. Se crea una vez por partida.
export function createGameId() {
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence.toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** @param {import('./juego.js').GameState} state */
export function toGameRecord(state, playerName) {
  if (state.status === 'playing' || !state.id || state.finishedAt === null || state.finalScore === null) return null;
  return {
    id: state.id,
    playerName,
    score: state.finalScore,
    categoryId: state.word.categoria,
    difficultyId: state.difficultyId,
    outcome: state.status,
    finishedAt: new Date(state.finishedAt).toISOString(),
  };
}
