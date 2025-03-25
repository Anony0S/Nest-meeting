import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Request } from 'express';

// 这里使用自定义装饰器，将 require-login 和 require-permission 添加到元数据中
export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require-permission', permissions);

/**
 * 自定义参数装饰器，用于获取用户信息
 * 传入属性名的时候，返回对应的属性值，否则返回全部的 user 信息
 */
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    if (!request.user) return null;

    return data ? request.user[data] : request.user;
  },
);
