import { checkSchema } from 'express-validator'

// export default [body('email').notEmpty()]

export default checkSchema({
    firstName: {
        errorMessage: 'Firstname is required',
        trim: true,
        notEmpty: true,
    },
    lastName: {
        errorMessage: 'Lastname is required',
        trim: true,
        notEmpty: true,
    },
    email: {
        errorMessage: 'Email is required',
        trim: true,
        notEmpty: true,
        isEmail: true,
    },
    password: {
        errorMessage: 'Password is required',
        trim: true,
        notEmpty: true,
        isLength: { options: { min: 8 } },
    },
})
