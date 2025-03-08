import { DataSource } from 'typeorm'
import bcrypt from 'bcrypt'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source'
import app from '../../src/app'
import { isJwt } from '../utils'
import { User } from '../../src/entity/User'
import { ROLES } from '../../src/constants'
import createJWKSMock, { JWKSMock } from 'mock-jwks'

describe('GET /auth/self', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>

    beforeAll(async () => {
        jwks = createJWKSMock('https://localhost:5503/')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterEach(async () => {
        jwks.stop()
    })

    afterAll(async () => {
        await connection.destroy()
    })

    describe('Given all fields', () => {
        it('should return the 200 status code', async () => {
            //GENERATE TOKEN
            const accessToken = jwks.token({
                sub: '1',
                role: ROLES.CUSTOMER,
            })

            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', `accessToken=${accessToken};`)
                .send()

            expect(response.statusCode).toBe(200)
        })

        it('should return the user data', async () => {
            //REGISTER USER
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            const userRepo = connection.getRepository(User)
            const data = await userRepo.save({
                ...userData,
                role: ROLES.CUSTOMER,
            })
            //GENERATE TOKEN
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            })
            //ADD TOKEN TO COOKIE
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', `accessToken=${accessToken};`)
                .send()
            //ASSERT
            //CHECK IF USERID MATCHES WITH REGISTERED USER
            expect(response.body.id).toEqual(data.id)
        })

        it('should not return the password field', async () => {
            //REGISTER USER
            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '12345678',
            }
            const userRepo = connection.getRepository(User)
            const data = await userRepo.save({
                ...userData,
                role: ROLES.CUSTOMER,
            })
            //GENERATE TOKEN
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            })
            //ADD TOKEN TO COOKIE
            const response = await request(app)
                .get('/auth/self')
                .set('Cookie', `accessToken=${accessToken};`)
                .send()
            //ASSERT
            //CHECK IF USERID MATCHES WITH REGISTERED USER
            expect(response.body).not.toHaveProperty('password')
        })
    })
})
