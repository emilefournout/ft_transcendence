import React from "react";
import { StatCards, StatType } from "./StatCards";
import { ProfilePageContext } from "../../../UserProfilePage";
import "../Profile.css";
import { useNavigate } from "react-router-dom";

interface StatsProps {
  wins: number;
  loses: number;
  id: number;
}

export function Stats(props: StatsProps) {
  const profilePageContext = React.useContext(ProfilePageContext);
  const navigate = useNavigate();
  const getRank = (): string | undefined => {
    const userPos: number | undefined = profilePageContext.ranking?.findIndex(
      (user) => user.id === props.id
    );
    if (userPos === undefined || userPos === -1) return undefined;
    return "#" + (userPos + 1).toString();
  };
  const rank = getRank();

  return (
    <div id="stats-card">
      <div className="window-title card-title">Stats</div>
      <div id="stats-values" className="card-body">
        <button onClick={() => navigate("/board/user-account/ranking")}>
          Ranking
        </button>
        <StatCards statType={StatType.win} statValue={props.wins?.toString()} />
        <StatCards
          statType={StatType.lose}
          statValue={props.loses?.toString()}
        />
        {rank && <StatCards statType={StatType.rank} statValue={rank} />}
      </div>
    </div>
  );
}
