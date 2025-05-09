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
        isEmail: {
            errorMessage: 'Email should be a valid email',
        },
    },
    password: {
        errorMessage: 'Password is required',
        trim: true,
        notEmpty: true,
        isLength: {
            options: { min: 8 },
            errorMessage: 'Password length should be atleast 8 characters',
        },
    },
})
