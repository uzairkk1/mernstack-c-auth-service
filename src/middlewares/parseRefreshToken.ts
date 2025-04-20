import { expressjwt } from 'express-jwt'
import { Config } from '../config'
import { Request, RequestHandler } from 'express'
import { AuthCookie } from '../types'

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET as string,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie

        return refreshToken
    }
}) as RequestHandler
