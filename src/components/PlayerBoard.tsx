import { Player, Card as CardType } from '../types/game';
import { Card } from './Card';

interface PlayerBoardProps {
  player: Player;
  isActive: boolean;
  onCardClick: (rowIndex: number, colIndex: number) => void;
}

export const PlayerBoard = ({ player, isActive, onCardClick }: PlayerBoardProps) => {
  const renderCard = (card: CardType, rowIndex: number, colIndex: number) => {
    if (card.isRemoved) {
      return (
        <div className="w-16 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
          <span className="text-gray-400">✓</span>
        </div>
      );
    }

    return (
      <Card
        key={`${rowIndex}-${colIndex}`}
        card={card}
        onClick={() => onCardClick(rowIndex, colIndex)}
      />
    );
  };

  return (
    <div 
      className={`
        p-6 rounded-xl shadow-lg transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-50 to-blue-100 ring-2 ring-blue-500' 
          : 'bg-white hover:shadow-xl'
        }
      `}
    >
      <h2 className="text-xl font-bold mb-4 flex justify-between items-center">
        <span>{player.name}</span>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-600">Score total : {player.totalScore}</span>
          {player.currentRoundScore > 0 && (
            <span className="text-sm text-gray-600">Cette manche : {player.currentRoundScore}</span>
          )}
        </div>
      </h2>
      <div className="grid gap-4">
        {player.cards.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-4">
            {row.map((card, colIndex) => (
              <div key={colIndex} className="relative">
                {renderCard(card, rowIndex, colIndex)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};