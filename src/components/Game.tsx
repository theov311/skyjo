import { useState } from 'react';
import { Card, Player, GameState } from '../types/game';
import { PlayerBoard } from './PlayerBoard';

interface GameProps {
  playerNames: string[];
}

const getBackgroundColor = (value: number) => {
  if (value < 0) return 'bg-gradient-to-br from-blue-400 to-blue-500';
  if (value <= 4) return 'bg-gradient-to-br from-green-400 to-green-500';
  if (value <= 8) return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
  return 'bg-gradient-to-br from-red-400 to-red-500';
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const values = [
    ...Array(5).fill(-2),
    ...Array(10).fill(-1),
    ...Array(10).fill(0),
    ...Array(10).fill(1),
    ...Array(10).fill(2),
    ...Array(10).fill(3),
    ...Array(10).fill(4),
    ...Array(10).fill(5),
    ...Array(10).fill(6),
    ...Array(10).fill(7),
    ...Array(10).fill(8),
    ...Array(10).fill(9),
    ...Array(10).fill(10),
    ...Array(10).fill(11),
    ...Array(5).fill(12),
  ];
  
  return values.map(value => ({ value, isRevealed: false }));
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Game = ({ playerNames }: GameProps) => {
  const initializeGame = () => {
    const deck = shuffleDeck(createDeck());
    const players: Player[] = playerNames.map((name, id) => {
      const cards: Card[][] = Array(3).fill(null).map(() =>
        Array(4).fill(null).map(() => deck.pop()!)
      );
      // Révéler 2 cartes au hasard pour chaque joueur
      for (let i = 0; i < 2; i++) {
        const row = Math.floor(Math.random() * 3);
        const col = Math.floor(Math.random() * 4);
        if (!cards[row][col].isRevealed) {
          cards[row][col].isRevealed = true;
        } else {
          i--;
        }
      }
      return {
        id,
        name,
        cards,
        totalScore: 0,
        currentRoundScore: 0,
        hasFinishedRound: false
      };
    });

    return {
      players,
      currentPlayerIndex: 0,
      deck,
      discardPile: [{ ...deck.pop()!, isRevealed: true }],
      isLastRound: false,
      lastRoundInitiator: -1,
      isRoundOver: false,
      isGameOver: false,
      roundNumber: 1
    };
  };

  const [gameState, setGameState] = useState<GameState>(initializeGame);
  const [drawnCard, setDrawnCard] = useState<Card | null>(null);
  const [canExchange, setCanExchange] = useState(false);
  const [mustRevealCard, setMustRevealCard] = useState(false);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);

  const checkIdenticalColumns = (playerIndex: number) => {
    const player = gameState.players[playerIndex];
    const newGameState = { ...gameState };
    let columnsRemoved = false;

    // Vérifier chaque colonne
    for (let col = 0; col < 4; col++) {
      const column = player.cards.map(row => row[col]);
      if (column.every(card => card.isRevealed && !card.isRemoved)) {
        const firstValue = column[0].value;
        if (column.every(card => card.value === firstValue)) {
          // Retirer les cartes de la colonne
          for (let row = 0; row < 3; row++) {
            newGameState.players[playerIndex].cards[row][col].isRemoved = true;
          }
          columnsRemoved = true;
        }
      }
    }

    if (columnsRemoved) {
      setGameState(newGameState);
    }
  };

  const checkRoundEnd = (playerIndex: number) => {
    const player = gameState.players[playerIndex];
    const allCardsRevealed = player.cards.every(row =>
      row.every(card => card.isRevealed || card.isRemoved)
    );

    if (allCardsRevealed) {
      const newGameState = { ...gameState };
      
      if (!gameState.isLastRound) {
        // Si c'est la première fois qu'un joueur révèle toutes ses cartes
        newGameState.isLastRound = true;
        newGameState.lastRoundInitiator = playerIndex;
        newGameState.players[playerIndex].hasFinishedRound = true;
        
        // Passer au joueur suivant
        newGameState.currentPlayerIndex = (playerIndex + 1) % newGameState.players.length;
        setGameState(newGameState);
        return true;
      } else {
        // Si on est déjà dans le dernier tour
        newGameState.players[playerIndex].hasFinishedRound = true;
        
        // Vérifier si tous les autres joueurs ont joué
        const remainingPlayers = newGameState.players
          .filter((_, idx) => idx !== gameState.lastRoundInitiator)
          .filter(p => !p.hasFinishedRound);

        if (remainingPlayers.length === 0) {
          // Si tous les joueurs ont joué leur dernier tour
          finishRound();
          return true;
        } else {
          // Passer au prochain joueur qui n'a pas encore joué
          let nextPlayerIndex = (playerIndex + 1) % newGameState.players.length;
          while (newGameState.players[nextPlayerIndex].hasFinishedRound) {
            nextPlayerIndex = (nextPlayerIndex + 1) % newGameState.players.length;
            if (nextPlayerIndex === playerIndex) break; // Éviter une boucle infinie
          }
          newGameState.currentPlayerIndex = nextPlayerIndex;
          setGameState(newGameState);
        }
      }
    }
    return false;
  };

  const calculateRoundScores = () => {
    const newGameState = { ...gameState };
    let lowestScore = Infinity;
    let lowestScorePlayerIndex = -1;

    // Calculer d'abord le score le plus bas
    newGameState.players.forEach((player, index) => {
      let score = 0;
      player.cards.forEach(row => {
        row.forEach(card => {
          if (!card.isRemoved) {
            score += card.value;
          }
        });
      });
      player.currentRoundScore = score;
      if (score < lowestScore) {
        lowestScore = score;
        lowestScorePlayerIndex = index;
      }
    });

    // Doubler le score du joueur qui a fini si ce n'est pas le plus bas
    if (gameState.lastRoundInitiator !== lowestScorePlayerIndex) {
      newGameState.players[gameState.lastRoundInitiator].currentRoundScore *= 2;
    }

    // Ajouter les scores de la manche aux scores totaux
    newGameState.players.forEach(player => {
      player.totalScore += player.currentRoundScore;
    });

    return newGameState;
  };

  const finishRound = () => {
    const newGameState = { ...gameState };

    // Retourner toutes les cartes face cachée restantes
    newGameState.players.forEach(player => {
      player.cards.forEach(row => {
        row.forEach(card => {
          if (!card.isRemoved) {
            card.isRevealed = true;
          }
        });
      });
    });

    // Calculer les scores...
    let lowestScore = Infinity;
    let lowestScorePlayerIndex = -1;

    // Calculer d'abord le score le plus bas
    newGameState.players.forEach((player, index) => {
      let score = 0;
      player.cards.forEach(row => {
        row.forEach(card => {
          if (!card.isRemoved) {
            score += card.value;
          }
        });
      });
      player.currentRoundScore = score;
      if (score < lowestScore) {
        lowestScore = score;
        lowestScorePlayerIndex = index;
      }
    });

    // Doubler le score du joueur qui a fini si ce n'est pas le plus bas
    if (gameState.lastRoundInitiator !== lowestScorePlayerIndex) {
      newGameState.players[gameState.lastRoundInitiator].currentRoundScore *= 2;
    }

    // Ajouter les scores de la manche aux scores totaux
    newGameState.players.forEach(player => {
      player.totalScore += player.currentRoundScore;
    });

    // Marquer la fin de la manche
    newGameState.isRoundOver = true;

    // Vérifier si le jeu est terminé (un joueur a atteint 100 points)
    if (newGameState.players.some(player => player.totalScore >= 100)) {
      newGameState.isGameOver = true;
    }

    setGameState(newGameState);
  };

  const drawCard = (fromDiscard: boolean = false) => {
    if (drawnCard || gameState.currentPlayerIndex === -1 || hasDrawnThisTurn) return;

    const newGameState = { ...gameState };
    let card;

    if (fromDiscard) {
      if (newGameState.discardPile.length > 0) {
        card = newGameState.discardPile.pop();
        setCanExchange(true);
        setMustRevealCard(false);
      }
    } else {
      card = newGameState.deck.pop();
      setCanExchange(true);
      setMustRevealCard(false);
    }

    if (card) {
      card.isRevealed = true;
      setDrawnCard(card);
      setHasDrawnThisTurn(true);
      setGameState(newGameState);
    }
  };

  const nextTurn = (newGameState: GameState) => {
    newGameState.currentPlayerIndex = (newGameState.currentPlayerIndex + 1) % newGameState.players.length;
    setHasDrawnThisTurn(false);
  };

  const handleCardClick = (playerIndex: number, rowIndex: number, colIndex: number) => {
    if (playerIndex !== gameState.currentPlayerIndex || gameState.isRoundOver) return;
    
    if (canExchange && drawnCard) {
      // Échanger la carte piochée avec une carte du joueur
      const newGameState = { ...gameState };
      const player = newGameState.players[playerIndex];
      const oldCard = player.cards[rowIndex][colIndex];
      
      // Sauvegarder l'ancienne carte
      const savedOldCard = { ...oldCard };
      
      // Remplacer l'ancienne carte par la carte piochée
      player.cards[rowIndex][colIndex] = drawnCard;
      
      // Mettre l'ancienne carte dans la défausse et la révéler
      savedOldCard.isRevealed = true;
      newGameState.discardPile.push(savedOldCard);
      
      // Réinitialiser l'état
      setDrawnCard(null);
      setCanExchange(false);
      
      // Vérifier si toutes les cartes sont révélées
      const allCardsRevealed = player.cards.every(row =>
        row.every(card => card.isRevealed || card.isRemoved)
      );

      if (allCardsRevealed && !gameState.isLastRound) {
        // Le joueur vient de révéler sa dernière carte, déclencher le dernier tour
        newGameState.isLastRound = true;
        newGameState.lastRoundInitiator = playerIndex;
        newGameState.players[playerIndex].hasFinishedRound = true;
        nextTurn(newGameState);
      } else if (gameState.isLastRound) {
        // Si on est déjà dans le dernier tour, marquer que ce joueur a fini
        newGameState.players[playerIndex].hasFinishedRound = true;
        // Vérifier si c'était le dernier joueur qui devait jouer
        const allPlayersFinished = newGameState.players
          .filter((_, idx) => idx !== gameState.lastRoundInitiator)
          .every(p => p.hasFinishedRound);
        
        if (allPlayersFinished) {
          // Si tous les autres joueurs ont joué leur dernier tour, terminer la manche
          finishRound();
          return;
        }
        // Sinon, passer au prochain joueur qui n'a pas joué son dernier tour
        let nextPlayer = (playerIndex + 1) % newGameState.players.length;
        while (newGameState.players[nextPlayer].hasFinishedRound && nextPlayer !== playerIndex) {
          nextPlayer = (nextPlayer + 1) % newGameState.players.length;
        }
        newGameState.currentPlayerIndex = nextPlayer;
        setHasDrawnThisTurn(false);
      } else {
        nextTurn(newGameState);
      }
      
      setGameState(newGameState);
      checkIdenticalColumns(playerIndex);
    } else if (mustRevealCard) {
      // Révéler une carte après avoir défaussé
      const newGameState = { ...gameState };
      const player = newGameState.players[playerIndex];
      const card = player.cards[rowIndex][colIndex];

      if (!card.isRevealed && !card.isRemoved) {
        card.isRevealed = true;
        setMustRevealCard(false);
        
        // Vérifier si toutes les cartes sont révélées
        const allCardsRevealed = player.cards.every(row =>
          row.every(card => card.isRevealed || card.isRemoved)
        );

        if (allCardsRevealed && !gameState.isLastRound) {
          // Le joueur vient de révéler sa dernière carte, déclencher le dernier tour
          newGameState.isLastRound = true;
          newGameState.lastRoundInitiator = playerIndex;
          newGameState.players[playerIndex].hasFinishedRound = true;
          nextTurn(newGameState);
        } else if (gameState.isLastRound) {
          // Si on est dans le dernier tour, marquer que ce joueur a fini
          newGameState.players[playerIndex].hasFinishedRound = true;
          // Vérifier si c'était le dernier joueur qui devait jouer
          const allPlayersFinished = newGameState.players
            .filter((_, idx) => idx !== gameState.lastRoundInitiator)
            .every(p => p.hasFinishedRound);
          
          if (allPlayersFinished) {
            // Si tous les autres joueurs ont joué leur dernier tour, terminer la manche
            finishRound();
            return;
          }
          // Sinon, passer au prochain joueur qui n'a pas joué son dernier tour
          let nextPlayer = (playerIndex + 1) % newGameState.players.length;
          while (newGameState.players[nextPlayer].hasFinishedRound && nextPlayer !== playerIndex) {
            nextPlayer = (nextPlayer + 1) % newGameState.players.length;
          }
          newGameState.currentPlayerIndex = nextPlayer;
          setHasDrawnThisTurn(false);
        } else {
          nextTurn(newGameState);
        }
        
        setGameState(newGameState);
        checkIdenticalColumns(playerIndex);
      }
    }
  };

  const discardDrawnCard = () => {
    // Cette fonction n'est utilisée que lorsqu'on pioche une carte et qu'on veut la défausser
    if (!drawnCard || !canExchange) return;

    const newGameState = { ...gameState };
    drawnCard.isRevealed = true;
    newGameState.discardPile.push(drawnCard);
    
    // Réinitialiser l'état de la carte piochée
    setDrawnCard(null);
    setCanExchange(false);
    
    // Le joueur doit maintenant révéler une carte face cachée
    setMustRevealCard(true);
    setGameState(newGameState);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2">Manche {gameState.roundNumber}</h1>
          <div className="text-2xl font-bold">
            Tour de {gameState.players[gameState.currentPlayerIndex].name}
          </div>
          {gameState.isLastRound && (
            <div className="text-lg text-red-600 mt-2">
              {gameState.players[gameState.lastRoundInitiator].name} a terminé ! 
              Dernier tour pour {gameState.players
                .filter((p, idx) => !p.hasFinishedRound)
                .map(p => p.name)
                .join(", ")}
            </div>
          )}
          {mustRevealCard && (
            <div className="text-lg text-blue-600 mt-2">
              Retournez une de vos cartes face cachée
            </div>
          )}
          <div className="text-sm text-gray-600 mt-4">
            Actions possibles :
            {!drawnCard && <>
              <div>- Prendre la carte de la défausse et l'échanger avec une de vos cartes</div>
              <div>- Piocher une carte : soit l'échanger avec une de vos cartes, soit la défausser et retourner une carte face cachée</div>
            </>}
            {drawnCard && canExchange && <>
              <div>- Échanger la carte piochée avec une de vos cartes</div>
              <div>- Défausser la carte piochée et retourner une de vos cartes face cachée</div>
            </>}
            {mustRevealCard && <div>- Retourner une de vos cartes face cachée</div>}
          </div>
        </div>

        <div className="mb-4 flex justify-center gap-8">
          {gameState.players.map(player => (
            <div key={player.id} className="text-center">
              <div className="font-medium">{player.name}</div>
              <div className="text-sm">Score total: {player.totalScore}</div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-start gap-8 mb-8">
          <div className="flex gap-4 justify-center w-full md:w-auto">
            <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2">Pioche</h3>
              <div 
                className="w-16 h-24 bg-gray-300 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors"
                onClick={() => !drawnCard && drawCard(false)}
              >
                <span className="text-2xl font-bold text-gray-500">?</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center">
              <h3 className="text-lg font-bold mb-2">Défausse</h3>
              <div 
                className="w-16 h-24 rounded-lg shadow-md flex items-center justify-center cursor-pointer"
                onClick={() => !drawnCard && gameState.discardPile.length > 0 && drawCard(true)}
              >
                {gameState.discardPile.length > 0 && (
                  <div className={`w-full h-full rounded-lg flex items-center justify-center ${getBackgroundColor(gameState.discardPile[gameState.discardPile.length - 1].value)}`}>
                    <span className="text-2xl font-bold text-white">
                      {gameState.discardPile[gameState.discardPile.length - 1].value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {drawnCard && (
            <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center w-full md:w-auto">
              <h3 className="text-lg font-bold mb-2">Carte piochée</h3>
              <div className="flex flex-col items-center gap-2">
                <div className={`w-16 h-24 rounded-lg shadow-md flex items-center justify-center ${getBackgroundColor(drawnCard.value)}`}>
                  <span className="text-2xl font-bold text-white">{drawnCard.value}</span>
                </div>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  onClick={discardDrawnCard}
                >
                  Défausser
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {gameState.players.map((player, index) => (
            <PlayerBoard
              key={player.id}
              player={player}
              isActive={index === gameState.currentPlayerIndex}
              onCardClick={(rowIndex, colIndex) => handleCardClick(index, rowIndex, colIndex)}
            />
          ))}
        </div>

        {gameState.isRoundOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6 text-center">
                {gameState.isGameOver ? "Fin du jeu !" : "Fin de la manche !"}
              </h2>
              <div className="space-y-3">
                {[...gameState.players]
                  .sort((a, b) => a.currentRoundScore - b.currentRoundScore)
                  .map((player, index) => (
                    <div key={player.id} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                      <span className="font-medium">{player.name}</span>
                      <div className="text-right">
                        <div className="font-bold">
                          {player.id === gameState.lastRoundInitiator && 
                           player.currentRoundScore !== player.currentRoundScore / 2 
                            ? `${player.currentRoundScore / 2} × 2 =`
                            : ''
                          } {player.currentRoundScore}
                        </div>
                        <div className="text-sm text-gray-600">
                          Total: {player.totalScore}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {!gameState.isGameOver && (
                <button
                  onClick={() => setGameState(prevState => ({
                    ...initializeGame(),
                    players: prevState.players.map(p => ({
                      ...p,
                      cards: [...Array(3)].map(() => Array(4).fill(null).map(() => ({ value: 0, isRevealed: false }))),
                      currentRoundScore: 0,
                      hasFinishedRound: false
                    })),
                    roundNumber: prevState.roundNumber + 1
                  }))}
                  className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Commencer la prochaine manche
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};