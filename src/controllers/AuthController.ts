import fs from 'fs'
import path from 'path'
import { NextFunction, Response } from 'express'
import { RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload, sign } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Config } from '../config/index'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // if (!email) {
        // const err = createHttpError(400, 'Email is required')
        // next(err)
        //     return
        // }
        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
            return
        }

        const { firstName, lastName, email, password } = req.body
        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
            password: '*********',
        })
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            })

            this.logger.info('New user has been registered', { id: user.id })

            let privateKey: Buffer
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                )
            } catch (error) {
                const err = createHttpError(
                    500,
                    'Error while reading private key',
                )
                next(err)
                return
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }
            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'mernspace-auth-service',
            })
            const refreshToken = sign(
                payload,
                Config.REFRESH_TOKEN_SECRET as string,
                {
                    algorithm: 'HS256',
                    expiresIn: '1y',
                    issuer: 'mernspace-auth-service',
                },
            )

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                httpOnly: true,
            })

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true,
            })

            res.status(201).json(user)
        } catch (error) {
            next(error)
            return
        }
    }
}
