import 'reflect-metadata';
import { RoleEnum } from "src/common/enum/role.enum";
import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Assessment } from "./assessment.entity";
import { Hr_Game } from "./hr_game.entity";
import { GameResult } from "./gameresult.entity";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column()
  fullname: string;

  @Column()
  password: string;

  @Column()
  role: RoleEnum;


  @OneToMany(() => Assessment, Assessment => Assessment.user)
  assesments: Assessment[];
  @OneToMany(() => Hr_Game, Hr_Game => Hr_Game.user)
  hr_game: Hr_Game[];
  @OneToMany(() => GameResult, GameResult => GameResult.hr)
  gameResult: GameResult[];
}
