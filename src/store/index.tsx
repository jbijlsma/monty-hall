import { createSlice, configureStore } from "@reduxjs/toolkit";

import { Door, Game, GameStrategy, StrategyStats } from "../models/game";

class _Game {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.reinit();
  }

  public restart(): void {
    this.reinit();

    if (this.game.autoplayActive) {
      this.chooseRandomDoor();
      this.openRandomDoor();

      const randomStrategy = Math.floor(Math.random() * 2);
      this.game.chosenStrategy = randomStrategy as GameStrategy;

      this.executeStrategy();
    }

    this.game.gameNumber++;
    this.game.chosenDoor = undefined;
    this.game.chosenStrategy = null;
  }

  public chooseDoor(doorId: number) {
    this.game.chosenDoor = this.game.doors.find((door) => door.id === doorId);
    this.openRandomDoor();
  }

  private didPlayerWin(): boolean {
    return (
      this.game.doors.findIndex(
        (door) => door.id === this.game.chosenDoor!.id && door.hasPrice
      ) >= 0
    );
  }

  private recordResult(): void {
    const strategyStats = (this.game.stats as any)[
      GameStrategy[this.game.chosenStrategy!].toString()
    ] as StrategyStats;
    strategyStats.played++;

    const won = this.didPlayerWin();
    if (won) {
      strategyStats.won++;
    }

    strategyStats.percentageWon =
      strategyStats.played === 0
        ? 0
        : Math.round((strategyStats.won / strategyStats.played) * 100);

    this.game.playerWon = won;

    for (let door of this.game.doors) {
      door.isOpen = true;
    }
  }

  public stay(): void {
    this.game.chosenStrategy = GameStrategy.stay;
    this.executeStrategy();
  }

  public switch(): void {
    this.game.chosenStrategy = GameStrategy.switch;
    this.executeStrategy();
  }

  private executeStrategy() {
    if (this.game.chosenStrategy === GameStrategy.switch) {
      this.switchDoor();
    }

    this.recordResult();
  }

  private switchDoor(): void {
    const options = this.game.doors.filter(
      (door) => !door.isOpen && door.id !== this.game.chosenDoor!.id
    );
    const randomOptionIndex = Math.floor(Math.random() * options.length);
    this.game.chosenDoor = options[randomOptionIndex];
  }

  private chooseRandomDoor() {
    const doors = this.game.doors;
    const randomDoorIndex = Math.floor(Math.random() * doors.length);
    this.game.chosenDoor = doors[randomDoorIndex];
  }

  private openRandomDoor() {
    const options = this.game.doors.filter(
      (door) => !door.hasPrice && door !== this.game.chosenDoor
    );
    const optionIndex = Math.floor(Math.random() * options.length);
    options[optionIndex].isOpen = true;
  }

  private reinit(): void {
    this.game.doors = [
      this.createDoor(1),
      this.createDoor(2),
      this.createDoor(3),
    ];
    this.placePriceBehindRandomDoor();
  }

  private createDoor(id: number): Door {
    return {
      id: id,
      isOpen: false,
      hasPrice: false,
    };
  }

  private placePriceBehindRandomDoor(): void {
    const randomDoorIndex = Math.floor(Math.random() * this.game.doors.length);
    this.game.doors[randomDoorIndex].hasPrice = true;
  }
}

const initialState = {
  doors: [],
  chosenStrategy: null,
  chosenDoor: undefined,
  playerWon: false,
  autoplayActive: false,
  stats: {
    stay: {
      played: 0,
      won: 0,
      percentageWon: 0,
    } as StrategyStats,
    switch: {
      played: 0,
      won: 0,
      percentageWon: 0,
    } as StrategyStats,
  },
  gameNumber: 0,
} as Game;

new _Game(initialState).restart();

const gameSlice = createSlice({
  name: "game",
  initialState: initialState,
  reducers: {
    restart(game) {
      new _Game(game).restart();
    },
    startAutoplay(game) {
      game.autoplayActive = true;
    },
    stopAutoplay(game) {
      game.autoplayActive = false;
    },
    chooseDoor(game, action) {
      const doorId = action.payload as number;
      new _Game(game).chooseDoor(doorId);
    },
    stay(game) {
      new _Game(game).stay();
    },
    switch(game) {
      new _Game(game).switch();
    },
  },
});

export const actions = gameSlice.actions;

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
