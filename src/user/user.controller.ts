import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  DefaultValuePipe,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Post,
  Query,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.sto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/utils/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginUserVo } from './vo/login-user.vo';
import { UserDetailVo } from './vo/user-info.vo';
import { UserListVo } from './vo/user-list.vo';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { storage } from 'src/utils/my-file-storage';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化成功';
  }

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功/注册失败',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已过期/验证码错误/用户名已存在',
    type: String,
  })
  @Post('register')
  async register(@Body() registerUser: RegisterUserDto) {
    return await this.userService.register(registerUser);
  }

  @ApiQuery({
    name: 'email',
    description: '邮箱',
    type: String,
    required: true,
    example: '123456@qq.com',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '发送成功',
    type: String,
  })
  @Get('register-captcha')
  async registerCaptcha(@Query('email') email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      throw new HttpException('无效的电子邮件格式', HttpStatus.BAD_REQUEST);
    const code = Math.random().toString(36).slice(-6);

    await this.redisService.set(`captcha_${email}`, code, 60 * 5);
    await this.emailService.sendEmail({
      to: email,
      subject: '注册验证码',
      html: `<p>你的注册验证码是：${code}</p>`,
    });

    return '发送成功';
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 Token',
    type: LoginUserVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, false);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
        email: vo.userInfo.email,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 Token',
    type: LoginUserVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto) {
    const vo = await this.userService.login(loginUser, true);

    vo.accessToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
        username: vo.userInfo.username,
        roles: vo.userInfo.roles,
        permissions: vo.userInfo.permissions,
        email: vo.userInfo.email,
      },
      {
        expiresIn: this.configService.get('jwt_access_token_expires_time'),
      },
    );

    vo.refreshToken = this.jwtService.sign(
      {
        userId: vo.userInfo.id,
      },
      {
        expiresIn:
          this.configService.get('jwt_refresh_token_expres_time') || '7d',
      },
    );

    return vo;
  }

  async getToken(refreshToken: string, isAdmin: boolean) {
    try {
      const data = this.jwtService.verify(refreshToken);

      const user = await this.userService.findUserById(data.userId, isAdmin);

      const access_token = this.jwtService.sign(
        {
          userId: user.id,
          username: user.username,
          roles: user.roles,
          permissions: user.permissions,
          email: user.email,
        },
        {
          expiresIn:
            this.configService.get('jwt_access_token_expires_time') || '30m',
        },
      );

      const refresh_token = this.jwtService.sign(
        {
          userId: user.id,
        },
        {
          expiresIn:
            this.configService.get('jwt_refresh_token_expres_time') || '7d',
        },
      );

      return { access_token, refresh_token };
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiQuery({
    name: 'refreshToken',
    description: '刷新 token',
    type: String,
    required: true,
    example: 'xxxxxxxxxxx',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在',
  })
  @Get('refresh')
  async refresh(@Query('refreshToken') refreshToken: string) {
    return await this.getToken(refreshToken, false);
  }

  @ApiQuery({
    name: 'refreshToken',
    description: '刷新 token',
    type: String,
    required: true,
    example: 'xxxxxxxxxxx',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在',
  })
  @Get('admin/refresh')
  async adminRefresh(@Query('refreshToken') refreshToken: string) {
    return await this.getToken(refreshToken, true);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息',
    type: UserDetailVo,
  })
  @ApiBearerAuth() // 需要登录
  @UseInterceptors(ClassSerializerInterceptor)
  @RequireLogin()
  @Get('info')
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findUserDetailById(userId);

    return user;
  }

  // 修改密码
  @ApiBody({
    type: UpdateUserPasswordDto,
  })
  @ApiResponse({
    type: String,
    description: '验证码已失效/不正确',
  })
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) {
    return await this.userService.updatePassword(passwordDto);
  }

  // 修改密码 验证码
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    description: '发送成功',
    type: String,
  })
  @Get('update_password/captcha')
  async updatePasswordCaptcha(@Query('email') email: string) {
    const code = Math.random().toString(36).slice(-6);

    await this.redisService.set(
      `update_password_captcha_${email}`,
      code,
      60 * 10,
    );
    await this.emailService.sendEmail({
      to: email,
      subject: '修改密码验证码',
      html: `<p>你的修改密码验证码是：
      <span style="color: blue; font-size: 18px; text-decoration: underline dotted;">${code}</span>
      </p>`,
    });

    return '发送成功';
  }

  // 修改用户信息
  @ApiBearerAuth()
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/不正确',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '更新成功',
    type: String,
  })
  @RequireLogin()
  @Post(['update', 'admin/update'])
  async update(
    @UserInfo('userId') userId: number,
    @UserInfo('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.userService.update(userId, email, updateUserDto);
  }

  // 修改用户信息验证码
  @ApiBearerAuth()
  @ApiResponse({
    description: '发送成功',
    type: String,
  })
  @Get('update/captcha')
  @RequireLogin()
  async updateCaptcha(@UserInfo('email') email: string) {
    const code = Math.random().toString().slice(2, 8);

    await this.redisService.set(`update_user_captcha_${email}`, code, 10 * 60);

    await this.emailService.sendEmail({
      to: email,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`,
    });
    return '发送成功';
  }

  // 冻结用户
  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    description: 'userId',
    type: Number,
  })
  @ApiResponse({
    type: String,
    description: 'success',
  })
  @RequireLogin()
  @Get('freeze')
  async freeze(@Query('id') userId: number) {
    await this.userService.freezeUserById(userId);
    return 'success';
  }

  // 用户列表
  @ApiBearerAuth()
  @ApiQuery({
    name: 'pageNo',
    description: '第几页',
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    description: '每页多少条',
    type: Number,
  })
  @ApiQuery({
    name: 'username',
    description: '用户名',
    type: String,
  })
  @ApiQuery({
    name: 'nickName',
    description: '昵称',
    type: String,
  })
  @ApiQuery({
    name: 'email',
    description: '邮箱地址',
    type: String,
  })
  @ApiResponse({
    description: '用户列表',
    type: UserListVo,
  })
  @RequireLogin()
  @Get('list')
  async list(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('nickName') nickName: string,
    @Query('email') email: string,
  ) {
    return await this.userService.findUsersByPage(
      pageNo,
      pageSize,
      username,
      nickName,
      email,
    );
  }

  // 上传图片
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads',
      storage: storage,
      limits: { fileSize: 1024 * 1024 * 3 },
      fileFilter(req, file, callback) {
        const extname = path.extname(file.originalname);
        if (['.png', '.jpg', '.gif'].includes(extname)) callback(null, true);
        else
          callback(
            new HttpException('只能上传图片', HttpStatus.BAD_REQUEST),
            false,
          );
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log('file', file);

    return path.posix.normalize(file.path);
  }
}
