import { NextFunction, Response } from 'express'
import { AuthRequest, RegisterUserRequest } from '../types'
import { UserService } from '../services/UserService'
import { Logger } from 'winston'
import { validationResult } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { TokenService } from '../services/TokenService'
import createHttpError from 'http-errors'
import { CredentialService } from '../services/CredentialService'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            })

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

            res.status(201).json({ id: user.id })
        } catch (error) {
            next(error)
            return
        }
    }

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
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

        const { email, password } = req.body
        this.logger.debug('New request to login a user', {
            email,
            password: '*********',
        })

        try {
            // check if username/email exists in database
            const user = await this.userService.findByEmail(email)
            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                )
                next(error)
                return
            }
            // compare password
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            )
            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    'Email or password does not match',
                )
                next(error)
                return
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }
            // generate tokens
            const accessToken = this.tokenService.generateAccessToken(payload)
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: newRefreshToken.id,
            })
            // add tokens to Cookie
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

            this.logger.info('user has been logged in', { id: user.id })
            // Return the response (id)
            res.status(200).json({ id: user.id })
        } catch (error) {
            next(error)
            return
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(Number(req.auth.sub))
        res.status(200).json(user)
    }
}
