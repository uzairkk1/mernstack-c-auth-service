import request from 'supertest'
import app from './../../src/app'

describe('POST /auth/register ', () => {
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
    })
    describe('Fields are missing', () => {})
})
