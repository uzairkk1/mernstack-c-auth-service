import { Repository } from 'typeorm'
import { User } from '../entity/User'
import bcrypt from 'bcrypt'
import { UserData } from '../types'
import createHttpError from 'http-errors'
import { ROLES } from '../config/constants'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
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
}
