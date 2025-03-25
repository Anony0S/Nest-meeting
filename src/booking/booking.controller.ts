import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { generateParseIntPipe } from 'src/utils/utils';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingListVo } from './vo/booking-list.vo';

@ApiTags('预定')
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @ApiOperation({ summary: '会议室预定列表' })
  @RequireLogin()
  @ApiQuery({
    name: 'pageNo',
    required: false,
    type: Number,
    description: '页码',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: '每页条数',
  })
  @ApiQuery({ name: 'username', required: false, type: String })
  @ApiQuery({ name: 'meetingRoomName', required: false, type: String })
  @ApiQuery({ name: 'meetingRoomPosition', required: false, type: String })
  @ApiQuery({
    name: 'bookingTimeRangeStart',
    required: false,
    type: Number,
    description: '预定时间范围开始',
  })
  @ApiQuery({
    name: 'bookingTimeRangeEnd',
    required: false,
    type: Number,
    description: '预定时间范围结束',
  })
  @ApiResponse({
    status: 200,
    description: '预定列表',
    type: BookingListVo,
  })
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
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomPosition') meetingRoomPosition: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number
  ) {
    return await this.bookingService.find(
      pageNo,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomPosition,
      bookingTimeRangeStart,
      bookingTimeRangeEnd
    );
  }

  @ApiOperation({ summary: '预定会议' })
  @ApiBody({
    description: '预定会议',
    type: CreateBookingDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '找不到该会议室/该时间段已被预订',
  })
  @Post('add')
  @RequireLogin()
  async add(
    @Body() booking: CreateBookingDto,
    @UserInfo('userId') userId: number,
  ) {
    await this.bookingService.add(booking, userId);
    return 'success';
  }

  @ApiOperation({ summary: '通过申请' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: '预定id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @RequireLogin()
  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @ApiOperation({ summary: '驳回申请' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: '预定id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @RequireLogin()
  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @ApiOperation({ summary: '解除' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: '预定id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @RequireLogin()
  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @ApiOperation({ summary: '催办' })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: '预定id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'success',
  })
  @RequireLogin()
  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return await this.bookingService.urge(id);
  }
}
