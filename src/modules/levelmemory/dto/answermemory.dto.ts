import { IsArray, IsNotEmpty } from "class-validator";
import { IsPattern } from "src/shared/decorator/PatternMemory.decorator";

export class AnswerMemoryDto{
    @IsNotEmpty()
    @IsArray()
    @IsPattern()
    answer: string[]
}