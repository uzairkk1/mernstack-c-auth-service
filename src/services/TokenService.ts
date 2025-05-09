import { sign, JwtPayload } from 'jsonwebtoken'
import createHttpError from 'http-errors'
import { Config } from '../config'
import { User } from '../entity/User'
import { RefreshToken } from '../entity/RefreshToken'
import { Repository } from 'typeorm'

export class TokenService {
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
    generateAccessToken(payload: JwtPayload) {
        let privateKey: string
        if (!Config.PRIVATE_KEY) {
            const err = createHttpError(500, 'PRIVATE_KEY is not set')
            throw err
        }
        try {
            privateKey = Config.PRIVATE_KEY
        } catch (error) {
            const err = createHttpError(500, 'Error while reading private key')
            throw err
        }

        const accessToken = sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'mernspace-auth-service',
        })
        return accessToken
    }
    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(
            payload,
            Config.REFRESH_TOKEN_SECRET as string,
            {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'mernspace-auth-service',
                jwtid: String(payload.id), //TODO need to know why we have done this
            },
        )

        return refreshToken
    }
    async persistRefreshToken(user: User) {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365
        //persist refresh token
        const newRefreshToken = await this.refreshTokenRepository.save({
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
            user: user,
        })

        return newRefreshToken
    }
    async deleteRefreshToken(tokenId: number) {
        await this.refreshTokenRepository.delete({ id: tokenId })
    }
}
