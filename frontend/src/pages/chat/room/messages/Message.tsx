import React, { useEffect, useState } from "react";
import { Msg } from "./Messages";
import { devlog } from "../../../../services/core";

interface MessageProps {
  message: Msg;
  isMyMessage: boolean;
  msgClasses: string;
  key: string;
}

export function Message(props: MessageProps) {
  const date = new Date(props.message.createdAt)
    .toLocaleString()
    .replace(", ", "\n");
  const [userName, setUserName] = useState<string | undefined>(undefined);
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_BACKEND}/user/info/${props.message.userId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
      .then((response) => {
        if (response.ok) return response.json();
        else throw new Error("Error getting user info");
      })
      .then((data) => {
        setUserName(
          data.username.length > 20
            ? data.username.substring(0, 17) + "..."
            : data.username
        );
      })
      .catch((error) => {
        devlog(error);
      });
  }, [props.message.userId]);

  return (
    <>
      {props.isMyMessage ? (
        <div className="message-container-right">
          <div
            className="wrapper-col message-date"
            style={{ textAlign: "right" }}
          >
            {"you " + date}
          </div>
          <div className={props.msgClasses}>{props.message.text}</div>
        </div>
      ) : (
        <div className="message-container-left">
          <div className={props.msgClasses}>{props.message.text}</div>
          <div
            className="wrapper-col message-date"
            style={{ textAlign: "left" }}
          >
            {userName + " " + date}
          </div>
        </div>
      )}
    </>
  );
}
