import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class candidateAccessDto{
    @IsEmail()
    @IsNotEmpty()
    email:string;
    
    @Transform(({obj})=>Number(obj.assessment_id))
    @IsNotEmpty()
    @IsNumber()
    assessment_id:number;
}