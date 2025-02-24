import request from 'supertest'
import app from './../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { isJwt, truncateTable } from '../utils'
import { User } from '../../src/entity/User'
import exp from 'node:constants'
import { ROLES } from '../../src/constants'
import { RefreshToken } from '../../src/entity/RefreshToken'

describe('POST /auth/register ', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //3)Assert
            expect(response.statusCode).toBe(201)
        })

        it('should return JSON', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //3)Assert application/json utf-8
            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            )
        })

        it('should persist the user in database', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users).toHaveLength(1)
            expect(users[0].email).toBe(userData.email)
            expect(users[0].firstName).toBe(userData.firstName)
            expect(users[0].lastName).toBe(userData.lastName)
        })

        it('should returned id after success', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            const parsed = JSON.parse(response.text)
            //3)Assert
            expect(parsed).toHaveProperty('id')
        })

        it('should assign a customer role', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0]).toHaveProperty('role')
            expect(users[0].role).toBe(ROLES.CUSTOMER)
        })

        it('should store the hashed paswword in  the database', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //3)Assert
            const userRepository = connection.getRepository(User)
            const users = await userRepository.find()
            expect(users[0].password).not.toBe(userData.password)
            expect(users[0].password).toHaveLength(60)
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/)
        })

        it('should return 400 status code if email is already registered', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act

            const userRepo = connection.getRepository(User)
            await userRepo.save({ ...userData, role: ROLES.CUSTOMER })

            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            const users = await userRepo.find()
            //3)Assert
            expect(response.statusCode).toBe(400)
            expect(users).toHaveLength(1)
        })

        it('should return access and refresh token', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            interface Headers {
                ['set-cookie']: string[]
            }
            let accessToken: string | undefined
            let refreshToken: string | undefined
            //assert
            const rawCookies = response.headers['set-cookie']
            // Normalize cookies: Ensure it's always an array
            const cookies: string[] = Array.isArray(rawCookies)
                ? rawCookies
                : rawCookies
                  ? [rawCookies]
                  : []
            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1]
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1]
                }
            })

            expect(accessToken).toBeDefined()
            expect(refreshToken).toBeDefined()

            expect(isJwt(accessToken)).toBeTruthy()
            expect(isJwt(refreshToken)).toBeTruthy()
        })

        it('should store the refresh token in db', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            const refreshTokenRepo = connection.getRepository(RefreshToken)
            // const refreshTokens = await refreshTokenRepo.find()
            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.id = :userId', {
                    userId: response.body.id,
                })
                .getMany()
            expect(tokens).toHaveLength(1)
        })
    })
    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: '',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })

        it('should return 400 status code if firstname is missing', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: '',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if lastname is missing', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: '',
                email: 'john@doe.com',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if password is missing', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })
    })

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: '  john@doe.com   ',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users[0].email).toBe(userData.email.trim())
        })

        it('should return 400 status code if email is not valid', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })
        it('should return 400 status code if password length is less than 8 characters', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '123456',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)

            //3)Assert
            expect(response.statusCode).toBe(400)

            const userRepo = connection.getRepository(User)
            const users = await userRepo.find()
            expect(users).toHaveLength(0)
        })
        it('should return array of messages if email is missing', async () => {
            //AAA
            //1)Arrange
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: '',
                password: '12345678',
            }
            //2)Act
            const response = await request(app)
                .post('/auth/register')
                .send(userData)
            //3)Assert
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors.length).toBeGreaterThan(1)
        })
    })
})
