export enum GameStrategy {
  stay = 0,
  switch,
}

export interface Door {
  id: number;
  isOpen: boolean;
  hasPrice: boolean;
}

export interface StrategyStats {
  played: number;
  won: number;
  percentageWon: number;
}

export interface Game {
  doors: Door[];
  chosenStrategy: GameStrategy | null;
  chosenDoor: Door | undefined;
  playerWon: boolean;
  autoplayActive: boolean;
  stats: {
    stay: StrategyStats;
    switch: StrategyStats;
  };
  gameNumber: number;
}
