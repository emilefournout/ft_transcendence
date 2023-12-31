import React, { useContext } from "react";
import { Member, RoomContextArgs } from "../../../Room";
import { useNavigate, useOutletContext } from "react-router-dom";
import ownerIcon from "./crownIcon.svg";
import adminIcon from "./shieldIcon.svg";
import promoteIcon from "./promote.svg";
import demoteIcon from "./demote.svg";
import muteIcon from "./mute.svg";
import unmuteIcon from "./unmute.svg";
import banIcon from "./ban.svg";
import kickIcon from "./kick.svg";
import playIcon from "./play.svg";
import { ErrorBody, MuteDialogContext } from "../../RoomParam";
import { devlog } from "../../../../../../services/core";
import { BoardContext } from "../../../../../board/Board";
import { ChatPageContext } from "../../../../Chat";

export interface ChatMembersCardProps {
  member: Member;
  showButtons: boolean;
  key: number;
}

export function ChatMembersCard(props: ChatMembersCardProps) {
  const roomContextArgs = useOutletContext<RoomContextArgs>();
  const chatPageContext = useContext(ChatPageContext);
  const muteDialogContext = useContext(MuteDialogContext);
  const chadId = roomContextArgs.chat.id;
  const navigate = useNavigate();
  const boardContext = useContext(BoardContext);
  const isMe = boardContext?.me.id === props.member.userId;
  const style = isMe
    ? { backgroundColor: "var(--Trans-Mooned-Teal-Strong)" }
    : {};
  const action = (route: string, method: string, body?: string) =>
    fetch(`${process.env.REACT_APP_BACKEND}/${route}`, {
      method: method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: body,
    }).then((response) => {
      if (!response.ok) {
        response
          .json()
          .then((data: ErrorBody) => {
            if (data.message && data.message === "User not in chat") {
              chatPageContext.updateLeaver("You are not member of this chat");
            }
            return;
          })
          .catch((error) => {
            devlog(error);
          });
      }
      roomContextArgs.getChatInfo(roomContextArgs.chat);
    });

  const promote = () =>
    action(
      `chat/${chadId}/user`,
      "PATCH",
      JSON.stringify({
        userId: props.member.userId,
        role: {
          owner: false,
          administrator: true,
        },
      })
    ).catch((error) => {
      devlog(error);
    });

  const demote = () =>
    action(
      `chat/${chadId}/user`,
      "PATCH",
      JSON.stringify({
        userId: props.member.userId,
        role: {
          owner: false,
          administrator: false,
        },
      })
    ).catch((error) => {
      devlog(error);
    });

  const unmute = () => {
    action(
      `chat/${chadId}/mute`,
      "DELETE",
      JSON.stringify({ userId: props.member.userId })
    ).catch((error) => {
      devlog(error);
    });
  };
  const ban = () =>
    action(
      `chat/${chadId}/ban`,
      "POST",
      JSON.stringify({ userId: props.member.userId })
    ).catch((error) => {
      devlog(error);
    });

  const kickOut = () =>
    action(
      `chat/${chadId}/user`,
      "DELETE",
      JSON.stringify({ id: props.member.userId })
    ).catch((error) => {
      devlog(error);
    });

  if (!boardContext) {
    return <>Loading</>;
  } else {
    return (
      <>
        <div
          title={props.member.username}
          style={style}
          className="room-param-user-name ellipsed-txt"
          onClick={() => navigate(`/board/user-account/${props.member.userId}`)}
        >
          {props.member.username}
        </div>
        {props.member.owner ? (
          <img src={ownerIcon} title="Room Owner" alt="Room owner icon" />
        ) : props.member.administrator ? (
          <img
            src={adminIcon}
            title="Room Admin"
            alt="Room administrator icon"
          />
        ) : (
          <></>
        )}
        {props.member.owner || !props.showButtons ? (
          <></>
        ) : (
          <>
            {props.member.administrator ? (
              <img
                id="demote-btn"
                src={demoteIcon}
                onClick={demote}
                title="Demote user"
                alt="Demote user icon"
              />
            ) : (
              <img
                id="promote-btn"
                src={promoteIcon}
                onClick={promote}
                title="Promote user"
                alt="Promote user icon"
              />
            )}
            {isMe ? (
              <></>
            ) : (
              <>
                {props.member.muted ? (
                  <img
                    id="unmute-btn"
                    src={unmuteIcon}
                    onClick={unmute}
                    title="Unmute user"
                    alt="Unmute user icon"
                  />
                ) : (
                  <img
                    id="mute-btn"
                    src={muteIcon}
                    onClick={() => muteDialogContext.mute(props.member.userId)}
                    title="Mute user"
                    alt="Mute user icon"
                  />
                )}
                <img
                  id="ban-btn"
                  src={banIcon}
                  onClick={ban}
                  title="Ban user"
                  alt="Ban user icon"
                />
                <img
                  id="kick-btn"
                  src={kickIcon}
                  onClick={kickOut}
                  title="Kick out user"
                  alt="Kick out user icon"
                />
              </>
            )}
          </>
        )}
        {isMe ? (
          <></>
        ) : (
          <>
            <img
              id="play-btn"
              src={playIcon}
              onClick={() => {
                navigate("/board/game/new-game", {
                  state: {
                    invite: props.member.username,
                  },
                });
              }}
              title="Challenge to a match!"
              alt="Challenge user to a match icon"
            />
          </>
        )}
      </>
    );
  }
}
