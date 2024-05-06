import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";
import { GametypeEnum } from "src/common/enum/gametype.enum";

export class CreateGameDto {

    @IsNotEmpty()
    @IsEnum(GametypeEnum)
    game_type: GametypeEnum;

    @IsNotEmpty()
    description: string;
    
    @Transform(({obj})=>Number(obj.total_question))
    @IsNotEmpty()
    @IsNumber()
    total_question: number;
    
    @Transform(({obj})=>Number(obj.total_time))
    @IsNotEmpty()
    @IsNumber()
    total_time: number;

}