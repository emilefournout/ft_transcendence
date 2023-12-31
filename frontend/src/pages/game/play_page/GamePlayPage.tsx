import React, { useEffect, useState } from "react";
import { GameCanvas, GameCanvasProps } from "./GameCanvas";
import { GameSocket } from "../../../services/socket";
import { useParams } from "react-router-dom";
import "./GamePlayPage.css";
import { EngGameDialog } from "./EndGameDialog";

enum GameExistState {
	Waiting,
	NotFound,
	Play,
}

export function GamePlayPage() {
	const [gameExistState, setGameExistState] = useState(GameExistState.Waiting);
	const { id } = useParams();
	const gameSocket = GameSocket.getInstance().socket;
	const boardState: GameCanvasProps = {
		width: 600,
		height: 350,
		padWidth: 10,
		padHeight: 60,
		leftPadHeight: 60,
		rightPadHeight: 60,
		ballRadius: 8,
		leftPad: 100,
		rightPad: 150,
		ballX: 100,
		ballY: 150,
		primaryColor: "black",
		secondaryColor: "white",
	};

	const [state, updateGameState] = useState(boardState);
	const [player1Score, updatePlayer1Score] = useState(0);
	const [player2Score, updatePlayer2Score] = useState(0);

	const [showModal, setShowModal] = useState<string | undefined>(undefined);

	const [showDialog, setShowDialog] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (showModal !== undefined) {
			setShowDialog(showModal + " wins");
		}
		return () => { };
	}, [showModal]);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_BACKEND}/game/info/${id}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("access_token")}`,
			},
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					setGameExistState(GameExistState.NotFound);
				}
			})
			.then((body) => {
				if (body && body.status !== "PLAYING")
					setGameExistState(GameExistState.NotFound);
				else {
					let path = window.location.pathname;
					path = path.substring(path.lastIndexOf("/") + 1);

					gameSocket.emit("join_active_room", { gameId: path });
					setGameExistState(GameExistState.Play);
				}
			});
	}, [gameSocket, id]);

	useEffect(() => {
		gameSocket.off("update");
		gameSocket.on("update", (data: any) => {
			updateGameState(data);
			updatePlayer1Score(data.player1Score);
			updatePlayer2Score(data.player2Score);
		});
	}, [gameSocket]);

	useEffect(() => {
		gameSocket.off("end");
		gameSocket.on("end", (data: any) => {
			setShowModal(data);
		});
	}, [gameSocket]);

	return (
		<>
			<EngGameDialog dialog={showDialog} setDialog={setShowDialog} />
			{gameExistState === GameExistState.Waiting ? (
				<div className="light-text">Waiting</div>
			) : gameExistState === GameExistState.NotFound ? (
				<div className="light-text">Not Found</div>
			) : (
				<>
					<h1 className="game-title">Game</h1>
					<h3 className="game-title game-controls">Controls: W/S or Up/Down</h3>
					<div className="scores">
						{player1Score !== -1 && player2Score !== -1 ? (
							<>
								<span>{player1Score}</span>
								<span>/</span>
								<span>{player2Score}</span>
							</>
						) : (
							<span> Disconnection </span>
						)}
					</div>
					<GameCanvas {...state} />
					{/*showModal !== null && (
						<div className="modal">
							<div className="modal-content wrapper-col">
								<p className="light-text">{showModal} wins</p>
								<Link to={"/board"}>
									<button>HOME</button>
								</Link>
							</div>
						</div>
					)*/}
				</>
			)}
		</>
	);
}
