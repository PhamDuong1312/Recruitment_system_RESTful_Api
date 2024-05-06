import { Expose, Transform } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsOptional, Length, isNotEmpty } from 'class-validator';
import * as moment from 'moment';

export class createAssessmentDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsArray()
  games: number[];

  @Transform(({obj})=>moment.utc(obj.startDate).toDate())
  @IsDate()
  startDate: Date=new Date();

  @Transform(({obj})=>moment.utc(obj.endDate).toDate())
  @IsDate()
  endDate: Date=new Date("9-9-9999");
}
