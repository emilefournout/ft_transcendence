import React, { useEffect, useState } from "react";
import "../Profile.css";
import { useNavigate } from "react-router-dom";
import { Achievement } from "../../full_achievements/FullAchievement";
import { AchievementCard } from "./AchievementCard";
import { devlog } from "../../../../../services/core";

interface AchievementsProps {
  userId: number;
}

export function Achievements(props: AchievementsProps) {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<
    Array<Achievement> | undefined
  >(undefined);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND}/achievements/${props.userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error getting achievements");
        }
        return response.json();
      })
      .then((data) => {
        setAchievements(data);
      })
      .catch((error) => {
        devlog(error);
      });
    return () => {};
  }, [props.userId]);

  if (achievements === undefined) {
    return <>Loading</>;
  } else {
    return (
      <div id="achievements-card">
        <div className="window-title card-title">Achievements</div>
        <div id="achievements-values" className="card-body">
          <button onClick={() => navigate("/board/user-account/achievements")}>
            all achievements
          </button>
          {achievements.map((achievement: Achievement, index) => {
            return (
              <AchievementCard
                title={achievement.name}
                description={achievement.description}
                key={index}
              />
            );
          })}
        </div>
      </div>
    );
  }
}
