# Skyjo

Une implémentation web du jeu de cartes Skyjo en React et TypeScript.

## Description

Skyjo est un jeu de cartes où le but est d'obtenir le moins de points possible. Les joueurs doivent gérer leurs cartes et décider stratégiquement quand les révéler pour minimiser leur score.

## Fonctionnalités

- 🎮 2 à 4 joueurs
- 🃏 Grille de 12 cartes (3x4) par joueur
- 🎲 Cartes de -2 à 12 avec différentes occurrences
- 🔄 Actions possibles à chaque tour :
  - Prendre une carte de la défausse et l'échanger avec une carte de son jeu
  - Piocher une carte et l'échanger avec une carte de son jeu
  - Piocher une carte, la défausser et retourner une carte face cachée
- ✨ Possibilité de retirer les colonnes de 3 cartes identiques
- 🏁 La manche se termine quand un joueur révèle toutes ses cartes
- 💯 Le score est doublé pour le joueur qui termine s'il n'a pas le plus petit score
- 🏆 Le jeu continue jusqu'à ce qu'un joueur atteigne 100 points

## Technologies utilisées

- React
- TypeScript
- Tailwind CSS
- Vite

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/theov311/skyjo.git
```

2. Installer les dépendances :
```bash
cd skyjo
npm install
```

3. Lancer le serveur de développement :
```bash
npm run dev
```

## Développement

Le projet est structuré de la manière suivante :

- `src/components/` : Contient tous les composants React
  - `Game.tsx` : Logique principale du jeu
  - `PlayerBoard.tsx` : Plateau de jeu d'un joueur
  - `Card.tsx` : Composant carte individuel
  - `Welcome.tsx` : Écran d'accueil
- `src/types/` : Types TypeScript utilisés dans l'application

## Règles du jeu

1. Chaque joueur commence avec 12 cartes face cachée et en révèle 2 au hasard
2. À son tour, un joueur peut :
   - Prendre la carte visible de la défausse et l'échanger avec une de ses cartes
   - Piocher une carte et :
     - soit l'échanger avec une de ses cartes
     - soit la défausser et retourner une de ses cartes cachées
3. Si un joueur aligne 3 cartes identiques en colonne, elles sont retirées du jeu
4. Quand un joueur révèle toutes ses cartes, les autres joueurs ont un dernier tour
5. Les points sont calculés et le score est doublé pour le joueur qui a fini s'il n'a pas le plus petit score
6. Le jeu continue jusqu'à ce qu'un joueur atteigne 100 points
