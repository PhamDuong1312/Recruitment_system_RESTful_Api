import { Transform } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class inviteCandidateDto{
    @IsArray()
    @IsNotEmpty()
    emails:string[];
    
    link:string;
    @Transform(({obj})=>Number(obj.assessment_id))
    @IsNotEmpty()
    @IsNumber()
    assessment_id:number;
}