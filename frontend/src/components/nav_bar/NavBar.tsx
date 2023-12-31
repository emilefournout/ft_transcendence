import React from "react";
import "./NavBar.css";
import settingsIcon from "../../common/config.svg";
import chatsIcon from "../../common/chats.svg";
import userIcon from "../../common/user.svg";
import { Link } from "react-router-dom";

export function NavBar() {
  return (
    <nav>
      <div id="nav-left-side">
        <Link to="/board/settings" className="nav-icons" title="Settings">
          <img src={settingsIcon} alt="Setting icon"></img>
        </Link>
        <Link to="/board/chats" className="nav-icons" title="Chats">
          <img src={chatsIcon} alt="Chat icon"></img>
        </Link>
        <Link to="/board/user-account" className="nav-icons" title="Profile">
          <img src={userIcon} alt="User icon"></img>
        </Link>
      </div>
      <Link to="/board/user-account">
        <h2 className="txt txt-shadow-top nav-responsive-text">PONG</h2>
      </Link>
      <Link
        to="/board/game"
        id="nav-right-side"
        className="btn btn-bottom-left nav-responsive-text"
      >
        Play
      </Link>
    </nav>
  );
}
