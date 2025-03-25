import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsNotEmpty({ message: '会议室ID不能为空' })
  @IsNumber()
  meetingRoomId: number;

  @ApiProperty()
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsNumber()
  startTime: number;

  @ApiProperty()
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsNumber()
  endTime: number;

  @ApiProperty({ description: '备注', required: false })
  note: string;
}
