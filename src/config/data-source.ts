import "reflect-metadata"
import { DataSource } from "typeorm"
import { User } from "../entity/User"
import { Config } from './index'

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT || 5432),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: Config.NODE_ENV !== 'prod',
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
})
