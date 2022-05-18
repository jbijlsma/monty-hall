import { createSlice, configureStore } from "@reduxjs/toolkit";

const didPlayerWin = (state) => {
  return (
    state.doors.findIndex(
      (door) => door.id === state.chosenDoor.id && door.hasPrice
    ) >= 0
  );
};

const showResult = (state) => {
  state.stats[state.chosenStrategy].played++;

  const won = didPlayerWin(state);
  if (won) {
    state.stats[state.chosenStrategy].won++;
  }

  state.stats[state.chosenStrategy].percentageWon =
    state.stats[state.chosenStrategy].played === 0
      ? 0
      : Math.round(
          (state.stats[state.chosenStrategy].won /
            state.stats[state.chosenStrategy].played) *
            100,
          0
        );
  state.playerWon = won;

  for (let door of state.doors) {
    door.isOpen = true;
  }
};

const switchDoor = (state) => {
  const options = state.doors.filter(
    (door) => !door.isOpen && door.id !== state.chosenDoor.id
  );
  const randomOptionIndex = Math.floor(Math.random() * options.length);
  state.chosenDoor = options[randomOptionIndex];
};

const openRandomDoor = (state) => {
  const options = state.doors.filter(
    (door) => !door.hasPrice && door !== state.chosenDoor
  );
  const optionIndex = Math.floor(Math.random() * options.length);
  options[optionIndex].isOpen = true;
};

const reinit = (state) => {
  const numberOfDoors = 3;
  const doors = [];

  for (let i = 0; i < numberOfDoors; i++) {
    doors.push({ id: i, hasPrice: false, isOpen: false });
  }

  const doorWithPriceIndex = Math.floor(Math.random() * numberOfDoors);
  doors[doorWithPriceIndex].hasPrice = true;

  state.doors = doors;
};

const gameSlice = createSlice({
  name: "game",
  initialState: {
    gameNumber: 0,
    doors: [],
    chosenStrategy: null,
    chosenDoor: null,
    playerWon: false,
    autoplayActive: false,
    stats: {
      switch: {
        played: 0,
        won: 0,
        percentageWon: 0,
      },
      stay: {
        played: 0,
        won: 0,
        percentageWon: 0,
      },
    },
  },
  reducers: {
    init(state) {
      reinit(state);
    },
    restart(state) {
      const chooseRandomDoor = (state) => {
        const doors = state.doors;
        const randomDoorIndex = Math.floor(Math.random() * doors.length);
        const door = doors.find((door) => door.id === randomDoorIndex);
        state.chosenDoor = door;
      };

      reinit(state);

      if (state.autoplayActive) {
        chooseRandomDoor(state);
        openRandomDoor(state);

        const randomStrategy = Math.floor(Math.random() * 2);
        if (randomStrategy === 0) {
          state.chosenStrategy = "stay";
          showResult(state);
        } else {
          state.chosenStrategy = "switch";
          switchDoor(state);
          showResult(state);
        }
      }

      state.gameNumber++;
      state.chosenDoor = null;
      state.chosenStrategy = null;
    },
    startAutoplay(state) {
      state.autoplayActive = true;
    },
    stopAutoplay(state) {
      state.autoplayActive = false;
    },
    chooseDoor(state, action) {
      const doorId = action.payload;
      const chosenDoor = state.doors.find((door) => door.id === doorId);
      state.chosenDoor = chosenDoor;
      openRandomDoor(state);
    },
    stay(state) {
      state.chosenStrategy = "stay";
      showResult(state);
    },
    switch(state) {
      state.chosenStrategy = "switch";
      switchDoor(state);
      showResult(state);
    },
  },
});

export const actions = gameSlice.actions;

export const store = configureStore({
  reducer: {
    game: gameSlice.reducer,
  },
});
