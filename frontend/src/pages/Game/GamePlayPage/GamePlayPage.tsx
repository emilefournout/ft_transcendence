import React, { useEffect, useState } from "react";
import { GameCanvas, GameCanvasProps } from "./GameCanvas";
import { GameSocket } from "../../../services/socket";
import { useNavigate, useParams } from "react-router-dom";

enum GameExistState {
  Waiting,
  NotFound,
  Play
}

export function GamePlayPage() {
  const [gameExistState, setGameExistState] = useState(GameExistState.Waiting);
  const {id} = useParams();
  const navigate = useNavigate();
  const gameSocket = GameSocket.getInstance().socket;
  const boardState: GameCanvasProps = {
    width: 600,
    height: 350,
    padWidth: 10,
    padHeight: 60,
    ballRadius: 8,
    leftPad: 100,
    rightPad: 150,
    ballX: 100,
    ballY: 150,
  };

  const [state, updateGameState] = useState(boardState);
  const [player1Score, updatePlayer1Score] = useState(0);
  const [player2Score, updatePlayer2Score] = useState(0);

  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND}/game/info/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        
      },
    }).then((response) => {
      if (response.ok) {
        setGameExistState(GameExistState.Play);
      }
      else {
        setGameExistState(GameExistState.NotFound);
      }
    })
    
  }, [id])

  useEffect(() => {
    gameSocket.off("update");
    gameSocket.on("update", (data: any) => {
      updateGameState(data);
      updatePlayer1Score(data.player1Score);
      updatePlayer2Score(data.player2Score);
    });
  }, [])

  useEffect(() => {
    gameSocket.off("end");
    gameSocket.on("end", (data: any) => {
        setShowModal(data);
    });
  }, [])

  const handleRedirect = () => {
    window.location.href = "http://localhost:8000/userAccount";
  };

  return (
    <>
      {gameExistState === GameExistState.Waiting ? (
        <div>Waiting</div>
      ) : gameExistState === GameExistState.NotFound ? (
        <div>Not Found</div>
      ) : (
        <>
          <h1 className="title">Game</h1>
          <div className="title">
            {player1Score} - {player2Score}
          </div>
          <GameCanvas {...state} />
          {showModal !== null && (
            <div className="modal">
              <div className="modal-content">
                <p>{showModal} wins</p>
                <button onClick={handleRedirect}>HOME</button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
