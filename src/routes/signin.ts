import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'

import { Password } from '../services/password'
import { User } from '../models/user'
import { validateRequest } from '../middlewares/validate-requests'
import { BadRequestError }  from '../errors/bad-request-error'

const router = express.Router()

router.post('/api/users/signin',
    [
        body('email')
            .isEmail()
            .withMessage('Email must be valid'),
        body('password')
            .trim()
            .notEmpty()
            .withMessage('You must supply a password')
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body
        
        const exisitingUser = await User.findOne({ email })
        if (!exisitingUser) {
            throw new BadRequestError('Invalid credentials')
        }

        const isMatch = await Password.compare(exisitingUser.password, password)

        if (!isMatch) {
            throw new BadRequestError('Invalid credientals')
        }
        console.log('hello?')
        // Generate JWT
        const userJwt = jwt.sign({
            id: exisitingUser.id,
            email: exisitingUser.email
        }, process.env.JWT_KEY!)

        // Store on session object
        req.session = {
            jwt: userJwt
        }

        res.status(201).send(exisitingUser)
})  

export { router as signInRouter }