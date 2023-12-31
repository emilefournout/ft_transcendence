import React from "react";
import SEO from "../../../components/Seo";
import { Link } from "react-router-dom";
import "../Game.css";
import { InvitationsColumns } from "./Invitations/InvitationsColumns";
import { WatchGameColumn } from "./WatchingGame/WatchGameColumn";

export function GameHomePage() {
  return (
    <>
      <SEO
        title="Pong - Game"
        description="Start a game with someone from the Internet with matchmaking or invite one of your friends."
      />

      <div className="wrapper-matchmaking">
        <Link
          className="btn game-creation-btn btn-top"
          to="/board/game/matchmaking"
        >
          Matchmaking
        </Link>
        <div className="wrapper-row txt game-creation-divider">Or</div>
        <Link
          className="btn btn-bottom game-creation-btn"
          to="/board/game/new-game"
        >
          Create a new game
        </Link>
        <div className="wrapper-row columns-wrapper">
          <InvitationsColumns />
          <WatchGameColumn />
        </div>
      </div>
      {/*separator or*/}
      {/*Invite Friend Form*/}
    </>
  );
}
