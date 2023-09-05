import React, { useEffect, useState } from "react";
import { InvitationCard } from "./InvitationCard";
import { testing } from "../../../../services/core";

export function InvitationsColumns() {
  const [invitations, setInvitations] = useState<Array<any>>([]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND}/game/invitations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error getting invitations");
        }
        return response.json();
      })
      .then((data: any) => {
        setInvitations(data.invitations);
      })
      .catch((error) => {
        if (testing) console.log(error);
      });
    return () => {};
  }, []);

  return (
    <div className="wrapper-col">
      <div>Invitations:</div>
      {invitations.length === 0 ? (
        <>No one invited you {invitations.length}</>
      ) : (
        invitations.map((invitation, index) => {
          if (!invitation) return null;
          return <InvitationCard id={invitation.inviterId} username={invitation.username} key={index} />;
        })
        
      )}
    </div>
  );
}