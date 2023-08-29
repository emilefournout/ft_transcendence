import React from "react";
import { useOutletContext } from "react-router-dom";
import { Member, RoomContextArgs } from "../../Room";
import { ChatMembersCard } from "./ChatMembersCard";
export function ChatMembers() {
  const roomContextArgs = useOutletContext<RoomContextArgs>();

  const admin: Member | undefined = roomContextArgs.chat.members?.find(
    (member) => member.administrator
  );
  const owners: Array<Member> | undefined =
    roomContextArgs.chat.members?.filter(
      (member) => member.owner && !member.administrator
    );
  const members: Array<Member> | undefined =
    roomContextArgs.chat.members?.filter(
      (member) => !member.owner && !member.administrator
    );

  if (roomContextArgs.chat.members === undefined || admin === undefined)
    return <></>;
  else
    return (
      <>
        <ChatMembersCard member={admin} key={admin.userId} />
        {owners &&
          owners.map((member) => (
            <ChatMembersCard member={member} key={member.userId} />
          ))}
        {members &&
          members.map((member) => (
            <ChatMembersCard member={member} key={member.userId} />
          ))}
      </>
    );
}