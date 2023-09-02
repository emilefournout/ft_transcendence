import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
  Put,
  BadRequestException
} from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from '../auth/decorator';
import { JwtAuthGuard } from 'src/auth/guard';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { UserBasicInfoDto } from './dto/info-user.dto';
import { AssignAchievementDto } from './dto/assign-achievement.dto';
import { UserControllerErrors } from './exceptions/user-controller.exception';
import { UserServiceErrors } from './exceptions/user-service.exception';
import { IdValidationPipe } from './pipes/id-validation.pipe';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('ranking')
  @ApiOperation({ summary: 'Returns the top 10 ranking.' })
  async getRanking(): Promise<UserBasicInfoDto[]> {
    return await this.userService.getRanking();
  }
  
  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns last 10 games of the user.' })
  async getUserHistory(@GetUser() user) {
    return this.userService.getUserHistory(user.sub);
  }

  @Get('history/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Returns last 10 games of the user based on the id.' })
  async getUserHistoryById(@Param('id', IdValidationPipe) id) {
    return this.userService.getUserHistory(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Returns a basic info about the user who requested.'
  })
  @ApiResponse({ type: UserBasicInfoDto })
  async findUserMe(@GetUser() user) {
    return this.findUser(user.sub);
  }

  @Get('info/id/:id')
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: 'Returns a basic info about a user.' })
  @ApiResponse({ type: UserBasicInfoDto })
  async findUser(@Param('id', IdValidationPipe) id) {
    const userInfo = await this.userService.getUserInfoById(id);
    if (!userInfo) throw new UserControllerErrors.UserNotFoundException();
    return userInfo;
  }

  @Get('info/username/:username')
  @UseGuards(JwtAuthGuard)
  @ApiParam({ name: 'username' })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns a basic info about user by its username.' })
  @ApiResponse({ type: UserBasicInfoDto })
  async getUserInfoByName(@Param('username') username: string) {
    return await this.userService.getUserInfoByName(username);
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Removes the user account.',
    description: 'Remove your account'
  })
  async deleteUser(@GetUser() user) {
    let userDeleted;

    try {
      userDeleted = await this.userService.deleteUser(user.sub);
    } catch (error) {
      console.log(error)
      throw new UserControllerErrors.UserNotDeletedException();
    }
    if (!userDeleted) throw new UserControllerErrors.UserNotDeletedException();
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Updates the user.',
    description: 'Takes username. If none are provided, returns 400'
  })
  async updateUser(@GetUser() user, @Body() updateUserDto: UpdateUserDto) {
    let userUpdated;
  
    try {
      userUpdated = await this.userService.updateUsername(user.sub, updateUserDto.username);
    } catch (error) {
      if (error instanceof UserServiceErrors.UsernameExistsException)
        throw new UserControllerErrors.UserNotUpdatedException(error.message);
    }
    if (!userUpdated) throw new UserControllerErrors.UserNotUpdatedException();
  }

  @Put('/achievements')
  @ApiOperation({ summary: 'Adds an achievement to a user.' })
  async assingAchievementToUser(
    @Body() assingAchievementDto: AssignAchievementDto
  ) {
    await this.userService.assingAchievementToUser(
      assingAchievementDto.id,
      assingAchievementDto.achievementName
    );
  }

  @Get('/friendships')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets user friendships.',
    description: 'If no friendships are found, 404 will be returned'
  })
  async getUserFriendships(@GetUser() user) {
    return await this.userService.getUserFriendships(user.sub);
  }

  @Get('/invitations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gets user game invitations.',
    description: 'If no invitations are found, 404 will be returned'
  })
  async getUserInvitations(@GetUser() user) {
    return await this.userService.getUserInvitations(user.sub);
  }

  @Post('/block/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the user the sender wants to block'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Blocks the user with id for the sender',
    description: 'The user with the id will be blocked'
  })
  @UseGuards(JwtAuthGuard)
  async addUserBlocked(@GetUser() user, @Param('id', IdValidationPipe) id: number) {
    await this.userService.addUserBlocked(user.sub, id);
  }

  @Delete('/block/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the user the sender wants to remove the block'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Removes the block to id for the sender',
    description: 'The user with the id will be unblocked'
  })
  @UseGuards(JwtAuthGuard)
  async deleteUserBlocked(
    @GetUser() user,
    @Param('id', IdValidationPipe) id: number
  ) {
    await this.userService.deleteUserBlocked(user.sub, id);
  }

  @Post('/friends/send/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the user the sender wants to be friends with'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Invites id to be friends',
    description: 'The user with the id will recieve a friendship request'
  })
  @UseGuards(JwtAuthGuard)
  async addUserFriends(@GetUser() user, @Param('id', IdValidationPipe) id: number) {
    await this.userService.addUserFriends(user.sub, id);
  }

  @Patch('/friends/accept/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the user that send the invitation'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Accepts the invitation from id',
    description: 'The user with the id will have its invitation accepted'
  })
  @UseGuards(JwtAuthGuard)
  async acceptUserFriends(
    @GetUser() user,
    @Param('id', IdValidationPipe) id: number
  ) {
    await this.userService.acceptUserFriends(user.sub, id);
  }

  @Delete('/friends/decline/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the user that send the invitation'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Declines id user invitation',
    description:
      'The user invitation to be friends from id with the will be declined'
  })
  @UseGuards(JwtAuthGuard)
  async declineUserFriends(
    @GetUser() user,
    @Param('id', IdValidationPipe) id: number
  ) {
    await this.userService.declineUserFriends(user.sub, id);
  }

  @Delete('/friends/delete/:id')
  @ApiParam({
    name: 'id',
    description: 'The id of the friend to delete'
  })
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletes a friend or a pending request',
    description:
      'If the friend or request is not found, 404 will be returned'
  })
  @UseGuards(JwtAuthGuard)
  async deleteUserFriends(
    @GetUser() user,
    @Param('id', IdValidationPipe) id: number
  ) {
    await this.userService.declineUserFriends(user.sub, id);
  }
}
