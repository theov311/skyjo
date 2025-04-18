import { useState } from 'react';
import { Welcome } from './components/Welcome';
import { Game } from './components/Game';

function App() {
  const [players, setPlayers] = useState<string[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = (playerNames: string[]) => {
    setPlayers(playerNames);
    setIsGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {!isGameStarted ? (
        <Welcome onStartGame={handleStartGame} />
      ) : (
        <Game playerNames={players} />
      )}
    </div>
  );
}

export default App;
