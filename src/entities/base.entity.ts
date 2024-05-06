import {  CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    // @PrimaryGeneratedColumn()
    // @Column()
    // id: number;

    @CreateDateColumn({name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({name: "updated_at"})
    updatedAt: Date;
}