import request from 'supertest'
import app from './../../src/app'
import { DataSource } from 'typeorm'
import { AppDataSource } from '../../src/config/data-source'
import { truncateTable } from '../utils'
import { User } from '../../src/entity/User'
import exp from 'node:constants'

describe('POST /auth/register ', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await truncateTable(connection)
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
                password: '123456',
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
                password: '123456',
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
                password: '123456',
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

        it('should have returned id after success', async () => {
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
            const parsed = JSON.parse(response.text)
            //3)Assert
            expect(parsed).toHaveProperty('id')
        })
    })
    describe('Fields are missing', () => {})
})
