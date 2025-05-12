import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { GameState } from '../types/game';

export class GameService {
  static async initialize() {
    // Initialisation des plugins natifs
    await StatusBar.setBackgroundColor({ color: '#f8fafc' });
    await SplashScreen.hide();

    // Gestion du bouton retour sur Android
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      }
    });
  }

  static async saveGameState(gameState: GameState) {
    await Preferences.set({
      key: 'gameState',
      value: JSON.stringify(gameState)
    });
  }

  static async loadGameState(): Promise<GameState | null> {
    const { value } = await Preferences.get({ key: 'gameState' });
    return value ? JSON.parse(value) : null;
  }

  static async clearGameState() {
    await Preferences.remove({ key: 'gameState' });
  }
}