import { Request } from 'express'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
    tenantId: number
}

export interface UpdateUserData {
    firstName: string
    lastName: string
}

export interface RegisterUserRequest extends Request {
    body: UserData
}

export interface AuthRequest extends Request {
    auth: {
        sub: string
        role: string
        id?: string
    }
}

export type AuthCookie = {
    accessToken: string
    refreshToken: string
}

export interface IRefreshTokenPayload {
    id: string
}


export interface ITenant {
    name: string
    address: string
}

export interface CreateTenantRequest extends Request {
    body: ITenant
}