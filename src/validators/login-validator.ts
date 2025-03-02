import { checkSchema } from 'express-validator'

// export default [body('email').notEmpty()]

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        trim: true,
        notEmpty: true,
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    password: {
        errorMessage: 'Password is required',
        trim: true,
        notEmpty: true,
    },
})
