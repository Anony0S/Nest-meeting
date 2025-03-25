import { ApiProperty } from '@nestjs/swagger';
import { MeetingRoom } from '../entities/meeting-room.entity';

export class MeetingRoomListVo {
  @ApiProperty({
    type: [MeetingRoom],
  })
  users: Array<MeetingRoom>;

  @ApiProperty()
  totalCount: number;
}
