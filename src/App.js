import React, { useState, Fragment } from "react";
import "./App.css";

const cardToValue = {
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "10": 10,
  JACK: 10,
  QUEEN: 10,
  KING: 10,
  ACE: 11
};

const getTotal = ({ cards }) => {
  const total = cards.reduce((acc, cur) => acc + cardToValue[cur.value], 0);
  if (total > 21) {
    const numAces = cards.filter(card => card.value === "ACE").length;
    return total - numAces * 10;
  }
  return total;
};

const Cards = ({ cards }) => {
  return cards.map((card, idx) => {
    return (
      <img key={idx} src={card.image} style={{ height: 200, width: 144 }} />
    );
  });
};

const App = () => {
  const [deckId, setDeckId] = useState();
  const [gameResult, setGameResult] = useState();
  const [houseCards, setHouseCards] = useState([]);
  const [houseCardsTotal, setHouseCardsTotal] = useState(0);
  const [playerCards, setPlayerCards] = useState([]);
  const [playerCardsTotal, setPlayerCardsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const getCard = async ({ deckId }) => {
    const drawResponse = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
    );
    const { cards } = await drawResponse.json();
    return cards[0];
  };
  const resetGame = async () => {
    setIsLoading(true);
    const result = await fetch(
      "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
    );
    const { deck_id: deckId } = await result.json();
    setDeckId(deckId);
    const newHouseCards = [
      await getCard({ deckId }),
      await getCard({ deckId })
    ];
    setHouseCards(newHouseCards);

    const newPlayerCards = [
      await getCard({ deckId }),
      await getCard({ deckId })
    ];
    setPlayerCards(newPlayerCards);
    setHouseCardsTotal(getTotal({ cards: newHouseCards }));
    setPlayerCardsTotal(getTotal({ cards: newPlayerCards }));
    setIsLoading(false);
    setGameResult(undefined);
  };
  const hit = async () => {
    const newPlayerCards = [...playerCards, await getCard({ deckId })];
    setPlayerCards(newPlayerCards);
    const newPlayerCardsTotal = getTotal({ cards: newPlayerCards });
    if (newPlayerCardsTotal > 21) {
      setGameResult("You lost");
    }
    setPlayerCardsTotal(newPlayerCardsTotal);
  };

  const stand = () => {
    setGameResult(playerCardsTotal > houseCardsTotal ? "You won" : "You lost");
  };
  return (
    <div style={{ margin: "15px", textAlign: "center" }}>
      <h1>Blackjack</h1>
      {isLoading ? (
        "Loading..."
      ) : (
        <Fragment>
          <button onClick={resetGame}>
            {deckId ? "Reset Game" : "Play Game"}
          </button>
          <h2>House ({houseCardsTotal})</h2>
          <Cards cards={houseCards} />
          <h2>You ({playerCardsTotal})</h2>
          <Cards cards={playerCards} />
          {gameResult ? (
            <h1>{gameResult}</h1>
          ) : (
            <div>
              <button onClick={hit}>Hit</button>
              <button onClick={stand}>Stand</button>
            </div>
          )}
        </Fragment>
      )}
    </div>
  );
};

export default App;
