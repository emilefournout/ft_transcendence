import React from "react";
import LockChatIcon from "./LockChatIcon.svg";
import "./Conversations.css";
import { ChatInfo } from "../../Chat";
import { useNavigate, useParams } from "react-router-dom";
import { Visibility } from "../../room/add/create/RoomCreate";

export interface ConversationsProps {
  chat: ChatInfo;
}

export function Conversations(props: ConversationsProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/board/chats/${props.chat.id}`, {
      state: { chat: props.chat },
    });
  };
  return (
    <div
      id={id && props.chat.id === parseInt(id) ? "selected-conversation" : ""}
      className="wrapper-row wrapper-conversation"
      key={props.chat.id}
      onClick={handleClick}
    >
      <p className="conversation-name ellipsed-txt">
        {props.chat.name ? props.chat.name : "No name"}
      </p>
      <div style={{ flexGrow: 1 }}></div>
      {props.chat.visibility === Visibility.PRIVATE ||
      props.chat.visibility === Visibility.PROTECTED ? (
        <img
          className="conversation-icons"
          src={LockChatIcon}
          alt="Look chat icon"
        />
      ) : (
        <></>
      )}
    </div>
    // <div className="wrapper-conversation wrapper-row">
    //	 {" "}
    //	 {/* An id called "selected-conversation" exists and should be given to the currently selected conversation only. */}
    //	 Priv 1
    //	 {/* The presence of the lock img depends on the conversation privacity conf. */}
    //	 <img className="conversation-icons" src={LockChatIcon}></img>
    // </div>
  );
}
