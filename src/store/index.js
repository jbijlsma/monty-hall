import { createStore } from "redux";

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
    (door) => !door.hasPrice && door.id !== state.chosenDoor.id
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

export const actions = {
  init: () => ({
    type: "init",
  }),
  restart: () => ({
    type: "restart",
  }),
  startAutoplay: () => ({
    type: "startAutoplay",
  }),
  stopAutoplay: () => ({
    type: "stopAutoplay",
  }),
  chooseDoor: (doorId) => ({
    type: "chooseDoor",
    doorId: doorId,
  }),
  stay: () => ({
    type: "stay",
  }),
  switch: () => ({
    type: "switch",
  }),
};

const cloneState = (state) => {
  const doors = state.doors.map((door) => ({ ...door }));
  const stats = {
    switch: {
      ...state.stats["switch"],
    },
    stay: {
      ...state.stats["stay"],
    },
  };

  return {
    ...state,
    doors: doors,
    chosenDoor: state.chosenDoor ? { ...state.chosenDoor } : null,
    stats: stats,
  };
};

const gameReducer = (
  state = {
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
  action
) => {
  if (action.type === actions.init().type) {
    const clonedState = cloneState(state);
    reinit(clonedState);
    return clonedState;
  }

  if (action.type === actions.restart().type) {
    const clonedState = cloneState(state);

    const chooseRandomDoor = (state) => {
      const doors = state.doors;
      const randomDoorIndex = Math.floor(Math.random() * doors.length);
      const door = doors.find((door) => door.id === randomDoorIndex);
      state.chosenDoor = door;
    };

    reinit(clonedState);

    if (clonedState.autoplayActive) {
      chooseRandomDoor(clonedState);
      openRandomDoor(clonedState);

      const randomStrategy = Math.floor(Math.random() * 2);
      if (randomStrategy === 0) {
        clonedState.chosenStrategy = "stay";
        showResult(clonedState);
      } else {
        clonedState.chosenStrategy = "switch";
        switchDoor(clonedState);
        showResult(clonedState);
      }
    }

    clonedState.gameNumber++;
    clonedState.chosenDoor = null;
    clonedState.chosenStrategy = null;

    return clonedState;
  }

  if (action.type === actions.startAutoplay().type) {
    const clonedState = cloneState(state);
    clonedState.autoplayActive = true;
    return clonedState;
  }

  if (action.type === actions.stopAutoplay().type) {
    const clonedState = cloneState(state);
    clonedState.autoplayActive = false;
    return clonedState;
  }

  if (action.type === actions.chooseDoor().type) {
    const clonedState = cloneState(state);
    const doorId = action.doorId;
    const chosenDoor = state.doors.find((door) => door.id === doorId);
    clonedState.chosenDoor = chosenDoor;
    openRandomDoor(clonedState);

    return clonedState;
  }

  if (action.type === actions.stay().type) {
    const clonedState = cloneState(state);
    clonedState.chosenStrategy = "stay";
    showResult(clonedState);

    return clonedState;
  }

  if (action.type === actions.switch().type) {
    const clonedState = cloneState(state);
    clonedState.chosenStrategy = "switch";
    switchDoor(clonedState);
    showResult(clonedState);

    return clonedState;
  }

  return state;
};

export const store = createStore(gameReducer);
