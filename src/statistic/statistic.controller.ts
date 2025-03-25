import { Controller, Get, HttpStatus, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserBookignCount } from './vo/UserBookignCount.vo';
import { MeetingRoomUsedCount } from './vo/MeetingRoomUsedCount.vo';

@ApiTags('数据统计')
@Controller('statistic')
export class StatisticController {
  @Inject(StatisticService)
  private statisticService: StatisticService;

  @ApiOperation({ summary: '用户预定量统计' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间',
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: '结束时间',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UserBookignCount,
  })
  @Get('userBookingCount')
  async userBookingCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime,
  ) {
    return this.statisticService.userBookingCount(startTime, endTime);
  }

  @ApiOperation({ summary: '会议室预定量统计' })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'startTime',
    type: String,
    description: '开始时间',
  })
  @ApiQuery({
    name: 'endTime',
    type: String,
    description: '结束时间',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MeetingRoomUsedCount,
  })
  @Get('meetingRoomUsedCount')
  async meetingRoomUsedCount(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime,
  ) {
    return this.statisticService.meetingRoomUsedCount(startTime, endTime);
  }
}
