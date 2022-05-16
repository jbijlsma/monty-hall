import { useState, useEffect, useCallback } from "react";
import "./App.css";

function App() {
  const numberOfDoors = 3;
  const [game, setGame] = useState({
    gameNumber: 0,
    doors: [],
    chosenStrategy: null,
    playerWon: false,
    autoplayActive: false,
    stats: {
      switch: {
        played: 0,
        won: 0,
      },
      stay: {
        played: 0,
        won: 0,
      },
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const restart = useCallback(() => {
    const doors = [];

    for (let i = 0; i < numberOfDoors; i++) {
      doors.push({ id: i, hasPrice: false, isChosen: false, isOpen: false });
    }

    const doorWithPriceIndex = Math.floor(Math.random() * numberOfDoors);
    doors[doorWithPriceIndex].hasPrice = true;

    if (game.autoplayActive) {
      chooseRandomDoor(doors);
      openRandomDoor(doors);

      const randomStrategy = Math.floor(Math.random() * 2);
      if (randomStrategy === 0) {
        stayAtChosenDoor();
      } else {
        switchDoor();
      }
    }

    setGame((prev) => {
      return {
        ...prev,
        gameNumber: prev.gameNumber + 1,
        doors: doors,
        chosenStrategy: null,
      };
    });
  });

  useEffect(() => {
    restart();
  }, []);

  useEffect(() => {
    console.log("useEffect");
    if (game.autoplayActive) {
      setTimeout(() => restart(), 10);
    }
  }, [game.autoplayActive, game.gameNumber, restart]);

  const startAutoplay = () => {
    setGame((prev) => {
      return {
        ...prev,
        autoplayActive: true,
      };
    });
  };

  const stopAutoplay = () => {
    setGame((prev) => {
      return {
        ...prev,
        autoplayActive: false,
      };
    });
  };

  const openRandomDoor = (doors) => {
    const options = doors.filter((door) => !door.hasPrice && !door.isChosen);
    const optionIndex = Math.floor(Math.random() * options.length);
    options[optionIndex].isOpen = true;
  };

  const chooseRandomDoor = (doors) => {
    const randomDoorIndex = Math.floor(Math.random() * numberOfDoors);
    const door = doors.find((door) => door.id === randomDoorIndex);
    door.isChosen = true;
  };

  const chooseDoor = (door) => {
    if (wasDoorChosen()) return;

    const doors = [...game.doors];
    const updatedDoor = { ...doors[door.id] };
    updatedDoor.isChosen = true;
    doors[door.id] = updatedDoor;

    openRandomDoor(doors);

    setGame((prev) => {
      return {
        ...prev,
        doors: doors,
      };
    });
  };

  const didPlayerWin = (doors) => {
    return doors.findIndex((door) => door.isChosen && door.hasPrice) >= 0;
  };

  const getPercentageWon = (strategy) => {
    return game.stats[strategy].played > 0
      ? Math.round(
          (game.stats[strategy].won / game.stats[strategy].played) * 100,
          0
        )
      : "";
  };

  const showResult = (strategy, doors) => {
    const stats = { ...game.stats };
    stats[strategy] = { ...stats[strategy] };

    stats[strategy].played = stats[strategy].played + 1;

    const won = didPlayerWin(doors);

    if (won) {
      stats[strategy].won++;
    }

    setGame((prev) => {
      return {
        ...prev,
        doors: doors.map((door) => {
          return { ...door, isOpen: true };
        }),
        chosenStrategy: strategy,
        playerWon: won,
        stats: stats,
      };
    });
  };

  const switchDoor = () => {
    const doors = [...game.doors];
    const currentlyChosenDoor = {
      ...doors.find((door) => door.isChosen),
    };
    const newlyChosenDoor = {
      ...doors.find((door) => !door.isChosen && !door.isOpen),
    };

    doors[currentlyChosenDoor.id] = currentlyChosenDoor;
    doors[newlyChosenDoor.id] = newlyChosenDoor;

    currentlyChosenDoor.isChosen = false;
    newlyChosenDoor.isChosen = true;

    showResult("switch", doors);
  };

  const stayAtChosenDoor = () => {
    showResult("stay", game.doors);
  };

  const wasDoorChosen = () => {
    return game.doors.findIndex((door) => door.isChosen) >= 0;
  };

  const doorElements = game.doors.map((door) => {
    let classNames = ["door-container"];
    if (door.isChosen) {
      classNames.push("chosen");
    }

    let priceSpan = "";
    if (door.isOpen) {
      priceSpan = door.hasPrice ? <span>🍓</span> : <span>🐐</span>;
    }

    return (
      <div
        key={door.id}
        onClick={() => chooseDoor(door)}
        className={classNames.join(" ")}
      >
        {priceSpan}
      </div>
    );
  });

  const stayOrSwitchButtons =
    wasDoorChosen() && !game.chosenStrategy && !game.autoplayActive ? (
      <div className="button-container">
        <button onClick={switchDoor}>Switch</button>
        <button onClick={stayAtChosenDoor}>Stay</button>
      </div>
    ) : null;

  let resultP = null;
  if (game.chosenStrategy) {
    const won = didPlayerWin(game.doors);
    resultP = won ? <p>Great! You won!!</p> : <p>Sorry, you lost :(</p>;
  }

  return (
    <div className="App">
      <div className="container">
        <div className="doors-container">{doorElements}</div>
      </div>
      <div className="container">{stayOrSwitchButtons}</div>
      <div className="container">{resultP}</div>
      <div className="container">
        {game.chosenStrategy && <button onClick={restart}>Restart</button>}
      </div>
      <div>
        <div>
          <p>
            Switch games played: {game.stats["switch"].played}, won:{" "}
            {game.stats["switch"].won} ({getPercentageWon("switch")} %)
          </p>
        </div>
        <div>
          <p>
            Stay games played: {game.stats["stay"].played}, won:{" "}
            {game.stats["stay"].won} ({getPercentageWon("stay")} %)
          </p>
        </div>
      </div>
      <div className="container">
        {!game.autoplayActive && (
          <button onClick={startAutoplay}>Start autoplay</button>
        )}
        {game.autoplayActive && (
          <button onClick={stopAutoplay}>Stop autoplay</button>
        )}
      </div>
    </div>
  );
}

export default App;
