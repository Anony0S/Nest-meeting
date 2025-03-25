import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MeetingRoom {
  @ApiProperty()
  @PrimaryGeneratedColumn({
    comment: '会议室ID',
  })
  id: number;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '会议室名字',
  })
  name: string;

  @ApiProperty()
  @Column({
    comment: '会议室容量',
  })
  capacity: number;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @ApiProperty()
  @Column({
    length: 50,
    comment: '设备',
    default: '',
  })
  equipment: string;

  @ApiProperty()
  @Column({
    length: 100,
    comment: '描述',
    default: '',
  })
  description: string;

  @ApiProperty()
  @Column({
    comment: '是否被预订',
    default: false,
  })
  isBooked: boolean;

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
