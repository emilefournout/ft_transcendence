import React, { useState } from "react";
import { FriendStatus, UserStatus } from "../../FriendStatus";
import "../FriendCard.css";
import { Avatar } from "../../../../../../components/Avatar";
import { User } from "../../../../../Board/Board";
import { useNavigate } from "react-router-dom";
import { ProfilePageContext } from "../../../../UserProfilePage";
import { CardAction } from "./CardAction";
import { Container } from "@mui/material";

export interface FriendCardProps {
  userInfo: User;
}

export function AcceptedFriendCard(props: FriendCardProps) {
  const navigate = useNavigate();
  return (
    <>
      <div className="friend-card">
        <div
          className="friend-card-avatar"
          onClick={() => navigate("/board/user-account/" + props.userInfo.id)}
        >
          <Avatar
            url={props.userInfo.avatar}
            size="48px"
            upload={false}
            download={true}
          />
        </div>
        <div
          className="friend-card-username ellipsed-txt"
          onClick={() => navigate("/board/user-account/" + props.userInfo.id)}
        >
          {props.userInfo.username}
        </div>
        <FriendStatus status={props.userInfo.status} />
        <CardAction userId={props.userInfo.id} />
      </div>
    </>
  );
}
