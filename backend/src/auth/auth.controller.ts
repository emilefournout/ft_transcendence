import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Express, Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from '../profile/profile.service';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { UserService } from 'src/user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private profileService: ProfileService
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Registers a new user' })
  @ApiResponse({
    description:
      'Returns an access token if the user logged in or throws an exception if not authorized.',
  })
  async registerAuth(
    @Req() request: Request,
    @Body() registerUser: RegisterUserDto,
    @UploadedFile() image?: Express.Multer.File
  ) {
    const token = extractTokenFromRequest(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    if (registerUser.username.length < 5)
      throw new BadRequestException('Username must be at least 5 characters long');
    try {
      const intraname =
        token === 'guest'
          ? 'guest'
          : await this.authService.getIntraLogin(token);
      let url: string;
      try {
        url = this.profileService.saveImage(image);
      } catch (error) {
        url = this.profileService.generateNewIcon();
      }
      return this.authService.register(
        intraname,
        registerUser.username,
        url,
        registerUser.code2fa
      );
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  @Get('qr-image')
  @ApiOperation({ summary: 'Returns a qr image for the 2FA' })
  @ApiResponse({
    description:
      'Renders and return a qr image given the secret for a given username.',
  })
  qrImage(@Query('user') user: string) {
    return this.authService.getQR(user);
  }

  @Get('set-2fa')
  @ApiOperation({ summary: 'Fixes the 2FA for a given user' })
  set2FA(@Query('user') user: string, @Query('code') code: string) {
    return this.authService.set2FA(user, code);
  }

  @Get('42token')
  @ApiOperation({ summary: 'Returns the 42 access token' })
  async get42Token(
    @Res() res: Response,
    @Query('code') code: string
  ): Promise<void> {
    let token: string;
    try {
      token = await this.authService.get42Token(code);
    } catch (error) {
      throw new UnauthorizedException();
    }
    try {
      const intraname: string = await this.authService.getIntraLogin(token);
      const user = await this.userService.findUserByFilter({ intraname });
      if (!user) {
        return res
          .cookie('42token', token)
          .redirect(`${process.env.FRONTEND_URI}/register`);
      } else {
        return res
          .cookie('42token', token)
          .cookie('username', user.username)
          .redirect(`${process.env.FRONTEND_URI}/login`);
      }
    } catch (error) {
      return res
        .cookie('42token', token)
        .redirect(`${process.env.FRONTEND_URI}/register`);
    }
  }
}

function extractTokenFromRequest(request) {
  return request.header('Authorization') &&
    request.header('Authorization').split(' ').length > 1
    ? request.header('Authorization').split(' ')[1]
    : '';
}
