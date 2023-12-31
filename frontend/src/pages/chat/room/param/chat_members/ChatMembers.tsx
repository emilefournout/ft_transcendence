import React from "react";
import { useOutletContext } from "react-router-dom";
import { Member, RoomContextArgs } from "../../Room";
import { ChatMembersCard } from "./ChatMembersCard/ChatMembersCard";
import { User } from "../../../../board/Board";
import { BannedMemberCard } from "./BannedMemberCard/BannedMemberCard";

interface ChatMembersProps {
  isManager: boolean;
}

export function ChatMembers(props: ChatMembersProps) {
  const roomContextArgs = useOutletContext<RoomContextArgs>();

  const owner: Member | undefined = roomContextArgs.chat.members?.find(
    (member) => member.owner
  );
  const admins: Array<Member> | undefined =
    roomContextArgs.chat.members?.filter(
      (member) => !member.owner && member.administrator
    );
  const members: Array<Member> | undefined =
    roomContextArgs.chat.members?.filter(
      (member) => !member.owner && !member.administrator
    );
  const banned: User[] | undefined = roomContextArgs.chat.banned;

  if (
    roomContextArgs.chat.members === undefined ||
    banned === undefined ||
    owner === undefined ||
    props.isManager === undefined
  )
    return <></>;
  else
    return (
      <>
        <ChatMembersCard
          member={owner}
          key={owner.userId}
          showButtons={props.isManager}
        />
        {admins &&
          admins.map((member) => (
            <ChatMembersCard
              member={member}
              key={member.userId}
              showButtons={props.isManager}
            />
          ))}
        {members &&
          members.map((member) => (
            <ChatMembersCard
              member={member}
              key={member.userId}
              showButtons={props.isManager}
            />
          ))}
        {banned &&
          banned.map((user) => <BannedMemberCard user={user} key={user.id} />)}
      </>
    );
}
