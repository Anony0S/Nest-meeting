import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { EntityManager, Like, Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  @InjectEntityManager()
  private readonly entityManager: EntityManager;

  /**
   * 初始化数据使用
   * 一般使用 repl 命令执行
   */
  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.meetingRoomRepository.save([room1, room2, room3]);
  }

  async find(
    pageNo: number,
    pageSize: number,
    name: string,
    capacity: number,
    equipment: string,
  ) {
    if (pageNo < 1) pageNo = 1;
    if (pageSize < 1) pageSize = 10;
    const condition: Record<string, any> = {};
    if (name) condition.name = Like(`%${name}%`);
    if (capacity) condition.capacity = capacity;
    if (equipment) condition.equipment = Like(`%${equipment}%`);
    const [meetingRooms, totalCount] =
      await this.meetingRoomRepository.findAndCount({
        skip: (pageNo - 1) * pageSize,
        take: pageSize,
        where: condition,
      });
    return {
      meetingRooms,
      totalCount,
    };
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.meetingRoomRepository.findOneBy({
      name: meetingRoomDto.name,
    });
    if (room) throw new BadRequestException('该会议室已存在');
    return await this.meetingRoomRepository.insert(meetingRoomDto);
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const room = await this.meetingRoomRepository.findOneBy({
      id: meetingRoomDto.id,
    });
    if (!room) throw new BadRequestException('该会议室不存在');

    room.capacity = meetingRoomDto.capacity;
    room.location = meetingRoomDto.location;
    room.name = meetingRoomDto.name;

    meetingRoomDto.equipment && (room.equipment = meetingRoomDto.equipment);
    meetingRoomDto.description &&
      (room.description = meetingRoomDto.description);

    await this.meetingRoomRepository.update({ id: meetingRoomDto.id }, room);

    return 'success';
  }

  async findById(id: number) {
    return this.meetingRoomRepository.findOneBy({ id });
  }

  async delete(id: number) {
    // TODO：删除所有预约记录 才能删除会议室
    // const bookinds = await this.entityManager.findBy()

    this.meetingRoomRepository.delete({ id });
    return 'success';
  }
}
