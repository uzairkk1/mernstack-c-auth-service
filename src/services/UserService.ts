import { Repository } from 'typeorm'
import { User } from '../entity/User'
import bcrypt from 'bcryptjs'
import { UpdateUserData, UserData } from '../types'
import createHttpError from 'http-errors'

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({
        firstName,
        lastName,
        email,
        password,
        role,
        tenantId,
    }: UserData) {
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
                role,
                tenant: tenantId ? { id: tenantId } : undefined,
            })
        } catch (error) {
            const err = createHttpError(
                500,
                'Failed to store the data in the database',
            )
            throw err
        }
    }

    async findByEmailWithPassword(email: string) {
        const user = await this.userRepository.findOne({
            where: { email },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        })
        return user
    }
    async findById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } })
        return user
    }
    async getAll() {
        return await this.userRepository.find()
    }
    async getById(userId: number) {
        return await this.userRepository.findOne({
            where: { id: userId },
        })
    }
    async deleteById(userId: number) {
        return await this.userRepository.delete(userId)
    }
    async update(id: number, tenantData: UpdateUserData) {
        return await this.userRepository.update(id, tenantData)
    }
}
