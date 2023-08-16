import { ApiProperty } from "@nestjs/swagger";
import { OnlineStatus } from "@prisma/client";
import { IsDefined } from "class-validator";

export class UserBasicInfoDto {
  @ApiProperty({
    type: Number,
    description: "Identification number of the user"
  })
  id: number;

  @ApiProperty()
  username: string;
  
  @ApiProperty()
  avatar: string;

  @ApiProperty()
  status: OnlineStatus;
  
  @ApiProperty()
  wins: number;

  @ApiProperty()
  loses: number;

  public static fromUser(user) {
    const userInfo = new UserBasicInfoDto();
    userInfo.id = user.id;
    userInfo.username = user.username;
    userInfo.status = user.status;
    userInfo.avatar = user.avatarURL;
    userInfo.wins = user.wins;
    userInfo.loses = user.loses;
    return userInfo;
  }
}
