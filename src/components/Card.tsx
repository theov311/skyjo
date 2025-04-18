import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
}

export const Card = ({ card, onClick }: CardProps) => {
  const getBackgroundColor = (value: number) => {
    if (!card.isRevealed) return 'bg-gradient-to-br from-gray-300 to-gray-400';
    if (value < 0) return 'bg-gradient-to-br from-blue-400 to-blue-500';
    if (value <= 4) return 'bg-gradient-to-br from-green-400 to-green-500';
    if (value <= 8) return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
    return 'bg-gradient-to-br from-red-400 to-red-500';
  };

  return (
    <div
      onClick={onClick}
      className={`
        w-16 h-24 
        ${getBackgroundColor(card.value)} 
        rounded-lg 
        shadow-lg 
        flex items-center justify-center 
        cursor-pointer 
        transform transition-all duration-200
        hover:scale-105 hover:shadow-xl 
        active:scale-95
        ${!card.isRevealed ? 'hover:from-gray-400 hover:to-gray-500' : ''}
        relative
        border-2 border-white/20
      `}
    >
      <div className={`
        absolute inset-0 rounded-lg
        transition-opacity duration-500
        ${card.isRevealed ? 'opacity-0' : 'opacity-100'}
        bg-gradient-to-br from-gray-200 to-gray-300
        pointer-events-none
      `} />
      
      <span className={`
        text-2xl font-bold
        ${card.isRevealed ? 'text-white' : 'text-gray-600/80'}
        drop-shadow
        transition-transform duration-200
        ${card.isRevealed ? 'scale-100' : 'scale-90'}
      `}>
        {card.isRevealed ? card.value : '?'}
      </span>
    </div>
  );
};