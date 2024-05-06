import 'reflect-metadata';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { User } from "./users.entity";
import { Game } from "./game.entity";

@Entity({name:'hr_game'})
export class Hr_Game extends BaseEntity{
    @PrimaryGeneratedColumn()
    id:number;

    @ManyToOne(()=>User,user=>user.hr_game)
    user:User;

    @ManyToOne(()=>Game,Game=>Game.hr_game)
    game:Game;
}