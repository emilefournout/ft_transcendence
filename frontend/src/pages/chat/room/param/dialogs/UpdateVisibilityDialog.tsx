import React, { useContext } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { RoomContextArgs } from "../../Room";
import { Visibility } from "../../add/create/RoomCreate";
import { ChatPageContext } from "../../../Chat";
import { DialogContext } from "../../../../root/Root";
import "../../../../root/Dialog.css";
import { devlog } from "../../../../../services/core";
import { ErrorBody } from "../RoomParam";

interface UpdateVisibilityDialogProps {
  showUpdateDialog: boolean;
  setShowUpdateDialog: (open: boolean) => void;
}

export function UpdateVisibilityDialog(props: UpdateVisibilityDialogProps) {
  const roomContextArgs = useOutletContext<RoomContextArgs>();
  const chatPageContext = useContext(ChatPageContext);
  const dialogContext = useContext(DialogContext);
  const setDialog = dialogContext.setDialog;
  const navigate = useNavigate();
  const close = () => {
    props.setShowUpdateDialog(false);
  };

  const updateVisibility = (visibility: Visibility) => {
    if (visibility === roomContextArgs.chat.visibility) {
      close();
      setDialog("visibility is already set to " + visibility);
      return;
    }
    if (visibility === Visibility.PROTECTED) {
      close();
      navigate("change-password");
      return;
    }
    fetch(`${process.env.REACT_APP_BACKEND}/chat/${roomContextArgs.chat.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chatVisibility: Visibility.PUBLIC }),
    })
      .then((response) => {
        if (response.ok) {
          //roomContextArgs.getChatInfo(roomContextArgs.chat);
          chatPageContext.updateChats().catch((error) => {
            devlog(error);
          });
          close();
          setDialog("visibility updated to " + Visibility.PUBLIC);
        } else {
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
      })
      .catch((error) => {
        close();
        devlog(error);
      });
  };

  return (
    <div>
      {props.showUpdateDialog ? (
        <dialog className="dialog-window wrapper-col">
          This room is {roomContextArgs.chat.visibility}
          <button
            disabled={roomContextArgs.chat.visibility === "PUBLIC"}
            onClick={() => updateVisibility(Visibility.PUBLIC)}
          >
            Public
          </button>
          <button
            disabled={roomContextArgs.chat.visibility === "PRIVATE"}
            onClick={() => updateVisibility(Visibility.PROTECTED)}
          >
            Protected
          </button>
          <button onClick={close}>Cancel</button>
        </dialog>
      ) : (
        <></>
      )}
    </div>
  );
}
