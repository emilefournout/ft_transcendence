import React, { useEffect, useState } from "react";
import { Message } from "./Message";
import { useParams } from "react-router-dom";
import "./Messages.css";
import { RoomInput } from "../RoomInput/RoomInput";
import { BoardContext } from "../../../Board/Board";
import { ChatSocket } from "../../../../services/socket";

export interface MsgProps {
  messages: Array<Msg>;
}

export interface Msg {
  uuid: string;
  text: string;
  createdAt: string;
  userId: number;
  roomId: number;
}

export function Messages() {
  const [messages, setMessages] = useState<Array<Msg>>([]);
  const chatSocket = ChatSocket.getInstance().socket;
  const { id } = useParams();
  useEffect(() => {
    chatSocket.emit("join_room", { roomId: id })
    fetch(`http://localhost:3000/chat/${id}/messages`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setMessages(data);
      });

    return () => {};
  }, [id]);

  useEffect(() => {
    chatSocket.off("receive_message");
    chatSocket.on("receive_message", (data) => {
      setMessages((msgs) => [...msgs, data]);
    });
  }, []);

  const boardContext = React.useContext(BoardContext);
  const myUserId = boardContext?.me.id;
  if (boardContext === undefined) return <>loading</>;
  else {
    return (
      <>
        <div className="wrapper-msgs">
          {messages.map((message: Msg) => {
            const isMyMessage =
              message.userId === myUserId
                ? "message message-right"
                : "message message-left";
            return (
              <Message
                message={message}
                isMyMessage={isMyMessage}
                key={message.uuid}
              />
            );
          })}
        </div>
        <RoomInput chatSocket={chatSocket} />
      </>
    );
  }
}
