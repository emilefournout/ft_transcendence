import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ChatVisibility } from "@prisma/client";

export class ChatBasicInfoDto {
  @ApiProperty({
    type: Number,
    description: "Identification number of the chat"
  })
  id: number;

  @ApiPropertyOptional({
    type: String,
    description: "Name of the chat"
  })
  name: string;
  
  @ApiProperty({
    type: ChatVisibility,
    description: "Visibility of the chat"
  })
  visibility: ChatVisibility;

  public static fromChat(chat) {
    const chatInfo = new ChatBasicInfoDto();
    chatInfo.id = chat.id;
    chatInfo.name = chat.name;
    chatInfo.visibility = chat.visibility;
    return chatInfo;
  }
}
