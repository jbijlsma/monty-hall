import { useSelector, useDispatch } from "react-redux";

import { actions } from "./store/index.js";
import "./App.css";
import { useEffect } from "react";

function App() {
  const game = useSelector((state) => state.game);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.init());
  }, [dispatch]);

  useEffect(() => {
    if (game.autoplayActive) {
      setTimeout(() => dispatch(actions.restart()));
    }
  }, [dispatch, game.gameNumber, game.autoplayActive]);

  const doorElements = game.doors.map((door) => {
    let classNames = ["door-container"];
    if (door.id === game.chosenDoor?.id) {
      classNames.push("chosen");
    }

    let priceSpan = "";
    if (door.isOpen) {
      priceSpan = door.hasPrice ? <span>🍓</span> : <span>🐐</span>;
    }

    return (
      <div
        key={door.id}
        onClick={() => dispatch(actions.chooseDoor(door.id))}
        className={classNames.join(" ")}
      >
        {priceSpan}
      </div>
    );
  });

  const stayOrSwitchButtons =
    game.chosenDoor && !game.chosenStrategy && !game.autoplayActive ? (
      <div className="button-container">
        <button onClick={() => dispatch(actions.switch())}>Switch</button>
        <button onClick={() => dispatch(actions.stay())}>Stay</button>
      </div>
    ) : null;

  let resultP = null;
  if (game.chosenStrategy) {
    resultP = game.won ? <p>Great! You won!!</p> : <p>Sorry, you lost :(</p>;
  }

  return (
    <div className="App">
      <div className="container">
        <div className="doors-container">{doorElements}</div>
      </div>
      <div className="container">{stayOrSwitchButtons}</div>
      <div className="container">{resultP}</div>
      <div className="container">
        {game.chosenStrategy && (
          <button onClick={() => dispatch(actions.restart())}>Restart</button>
        )}
      </div>
      <div>
        <div>
          <p>
            Switch games played: {game.stats["switch"].played}, won:{" "}
            {game.stats["switch"].won} ({game.stats["switch"].percentageWon} %)
          </p>
        </div>
        <div>
          <p>
            Stay games played: {game.stats["stay"].played}, won:{" "}
            {game.stats["stay"].won} ({game.stats["stay"].percentageWon} %)
          </p>
        </div>
      </div>
      <div className="container">
        {!game.autoplayActive && (
          <button onClick={() => dispatch(actions.startAutoplay())}>
            Start autoplay
          </button>
        )}
        {game.autoplayActive && (
          <button onClick={() => dispatch(actions.stopAutoplay())}>
            Stop autoplay
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
