export type Card = {
  value: number;
  isRevealed: boolean;
  isRemoved?: boolean; // Pour les cartes retirées du jeu (colonnes identiques)
};

export type Player = {
  id: number;
  name: string;
  cards: Card[][];
  totalScore: number; // Score total sur toutes les manches
  currentRoundScore: number; // Score de la manche en cours
  hasFinishedRound: boolean; // Indique si le joueur a révélé toutes ses cartes
};

export type GameState = {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  isLastRound: boolean; // Indique si on est dans le dernier tour
  lastRoundInitiator: number; // Index du joueur qui a déclenché le dernier tour
  isRoundOver: boolean;
  isGameOver: boolean;
  roundNumber: number;
};