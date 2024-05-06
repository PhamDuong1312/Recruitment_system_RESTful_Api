import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { UsersEntity } from '../../../src/entities/index';
import { RoleEnum } from "../../../src/common/enum/role.enum";


export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const current = new Date();
    const firstThisWeek = current.getDate() - current.getDay() + 1;
    const users = [
      {
        id: 2,
        email: 'phamquyduong@gmail.com',
        fullname:"Phạm Quý Dương",
        password:
          '$2b$10$8NoeFbeBargsDsClhpfkDexfk0RtV6kDSJa/yTOwJ3Wbo3n6e3k/.', //123456
        role:RoleEnum.ADMIN,
        created_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
        updated_at: new Date(
          new Date().setDate(firstThisWeek - 7),
        ).toISOString(),
      }
    ];
    await connection
    .createQueryBuilder()
    .insert()
    .into(UsersEntity)
    .values(users)
    .execute();
  }
}
