import { IsBoolean,IsNotEmpty } from "class-validator";

export class AnswerLogicalDto{

    @IsNotEmpty()
    @IsBoolean()
    answer: boolean;
}