import { expressjwt } from 'express-jwt'
import { Config } from '../config'
import { Request, RequestHandler } from 'express'
import { AuthCookie, IRefreshTokenPayload } from '../types'
import { AppDataSource } from '../config/data-source'
import { RefreshToken } from '../entity/RefreshToken'
import logger from '../config/logger'

export default expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET as string,
    algorithms: ['HS256'],
    getToken(req: Request) {
        const { refreshToken } = req.cookies as AuthCookie

        return refreshToken
    },
    async isRevoked(req: Request, token) {
        const tokenId = Number((token?.payload as IRefreshTokenPayload).id)
        try {
            const refreshTokenRepo = AppDataSource.getRepository(RefreshToken)
            const refreshToken = await refreshTokenRepo.findOne({
                where: {
                    id: tokenId,
                    user: { id: Number(token?.payload.sub) },
                },
            })

            return refreshToken === null
        } catch (err) {
            logger.error('Error while getting the refresh token', {
                id: tokenId,
            })
            return true
        }
    },
}) as RequestHandler
