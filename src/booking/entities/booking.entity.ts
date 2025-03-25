import { ApiProperty } from '@nestjs/swagger';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;
  
  @Column({
    comment: '会议开始时间',
    precision: 6,
  })
  @ApiProperty()
  startTime: Date;
  
  @Column({
    comment: '会议结束时间',
    precision: 6,
  })
  @ApiProperty()
  endTime: Date;
  
  @ApiProperty()
  @Column({
    length: 20,
    comment: '状态（申请中、审批通过、审批驳回、已解除）',
    default: '申请中',
  })
  status: string;
  
  @ApiProperty()
  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  note: string;
  
  @ApiProperty()
  @ManyToOne(() => User)
  user: User;
  
  @ApiProperty()
  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;
  
  @ApiProperty()
  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;
  
  @ApiProperty()
  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
