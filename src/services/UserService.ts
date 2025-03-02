import { Repository } from 'typeorm'
import { User } from '../entity/User'
import bcrypt from 'bcrypt'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { ROLES } from '../constants'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const userExist = await this.userRepository.findOne({
            where: { email },
        })
        if (userExist != undefined) {
            const err = createHttpError(400, 'Email already exists')
            throw err
        }

        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: ROLES.CUSTOMER,
            })
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store the data in the database',
            )
            throw err
        }
    }

    async findByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email } })
        return user
    }
}
