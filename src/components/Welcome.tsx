import { useState } from 'react';

interface WelcomeProps {
  onStartGame: (players: string[]) => void;
}

export const Welcome = ({ onStartGame }: WelcomeProps) => {
  const [numPlayers, setNumPlayers] = useState<number>(2);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);

  const handleNumPlayersChange = (num: number) => {
    setNumPlayers(num);
    setPlayerNames(Array(num).fill(''));
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerNames.every(name => name.trim())) {
      onStartGame(playerNames);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Bienvenue sur Skyjo
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3 text-center">
              Nombre de joueurs
            </label>
            <div className="flex justify-center space-x-4">
              {[2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  className={`
                    w-14 h-14 rounded-lg font-bold text-lg
                    transition-all duration-200
                    ${numPlayers === num 
                      ? 'bg-blue-500 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                  onClick={() => handleNumPlayersChange(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            {playerNames.map((name, index) => (
              <div key={index} className="relative">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Joueur {index + 1}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  placeholder={`Nom du joueur ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Commencer la partie
          </button>
        </form>
      </div>
    </div>
  );
};