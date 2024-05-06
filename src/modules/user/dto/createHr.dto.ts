import { IsEmail, IsNotEmpty, Length, isNotEmpty } from 'class-validator';

export class createHrDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
    @IsNotEmpty()
    fullname: string;
    @IsNotEmpty()
    @Length(8)
    password: string;
    @IsNotEmpty()
    games: number[]
}
