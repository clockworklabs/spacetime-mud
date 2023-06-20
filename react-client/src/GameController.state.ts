import { atom } from 'recoil';
import { GameController } from './GameController';

export const game_controller = atom<{ controller: GameController }>({
    controller: new GameController()
})