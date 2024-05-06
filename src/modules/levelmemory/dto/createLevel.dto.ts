import { Transform } from "class-transformer"
import { IsArray, IsNotEmpty, IsNumber } from "class-validator"
import { IsPattern } from "src/shared/decorator/PatternMemory.decorator"

export class CreateLevelDto {

    @IsNotEmpty()
    @IsArray()
    @IsPattern()
    pattern: string[]

    @Transform(({obj})=>Number(obj.gameId))
    @IsNotEmpty()
    @IsNumber()
    gameId:number


}