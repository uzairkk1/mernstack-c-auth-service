import { expressjwt, GetVerificationKey } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { Config } from '../config'
import { Request, RequestHandler } from 'express'
import { AuthCookie } from '../types'

export default expressjwt({
    secret: jwksRsa.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as unknown as GetVerificationKey,
    algorithms: ['RS256'],
    getToken(req: Request) {
        const authHeaders = req.headers.authorization
        if (authHeaders && authHeaders.split(' ')[1] !== 'undefined') {
            const token = authHeaders.split(' ')[1]
            if (token) {
                return token
            }
        }

        const { accessToken } = req.cookies as AuthCookie
        return accessToken
    },
}) as RequestHandler
