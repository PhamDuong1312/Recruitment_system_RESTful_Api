import { Transform } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsNumber } from "class-validator"

export class CreateQuestionDto {

    question: string

    @IsNotEmpty()
    statement1: string

    @IsNotEmpty()
    statement2: string

    @IsNotEmpty()
    conclusion: string

    @IsNotEmpty()
    @IsBoolean()
    correct: boolean
    
    @Transform(({obj})=>Number(obj.points))
    points: number

    @Transform(({obj})=>Number(obj.gameId))
    @IsNotEmpty()
    @IsNumber()
    gameId:number


}