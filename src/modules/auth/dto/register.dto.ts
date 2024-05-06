import { Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, Length, isNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  fullname: string;

  @IsNotEmpty()
  @Length(8)
  password: string;
}
