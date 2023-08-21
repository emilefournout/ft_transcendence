import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { MembershipService } from './membership.service';
import { UserService } from 'src/user/user.service';
import { ChatGateway } from './chat.gateway';
import { UserModule } from 'src/user/user.module';
import { GameModule } from 'src/game/game.module';

@Module({
  imports: [GameModule],
  controllers: [ChatController],
  providers: [ChatService, MembershipService, UserService, ChatGateway],
})
export class ChatModule {}
