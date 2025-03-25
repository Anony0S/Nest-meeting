import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../entities/booking.entity';

export class BookingListVo {
  @ApiProperty({
    type: [Booking],
  })
  bookings: Array<Booking>;

  @ApiProperty()
  totalCount: number;
}
