import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'permissions',
})
export class Permission {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;
  
  @Column({
    length: 20,
    comment: '权限代码',
  })
  @ApiProperty()
  code: string;
  
  @Column({
    length: 100,
    comment: '权限描述',
  })
  @ApiProperty()
  description: string;
}
