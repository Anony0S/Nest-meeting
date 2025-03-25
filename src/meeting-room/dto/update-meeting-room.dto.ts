import { CreateMeetingRoomDto } from './create-meeting-room.dto';
import { IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMeetingRoomDto extends CreateMeetingRoomDto {
  @ApiProperty()
  @IsNotEmpty({
    message: 'id 不能为空',
  })
  id: number;

  @ApiProperty()
  @MaxLength(50, {
    message: '设备最长为 50 字符',
  })
  @IsOptional()
  equipment: string;

  @ApiProperty()
  @MaxLength(100, {
    message: '描述最长为 100 字符',
  })
  @IsOptional()
  description: string;
}
