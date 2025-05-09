import 'reflect-metadata'
import express, { Request, Response, NextFunction } from 'express'
import logger from './config/logger'
import { HttpError } from 'http-errors'
import authRouter from './routes/auth'
import tenantRouter from './routes/tenant'
import userRouter from './routes/user'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
    }),
)
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Welcome to auth service')
})

app.use('/auth', authRouter)
app.use('/tenants', tenantRouter)
app.use('/users', userRouter)

//global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || err.status || 500
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                location: '',
            },
        ],
    })
})

export default app
