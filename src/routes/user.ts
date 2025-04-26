import express, {  NextFunction, Request, Response } from 'express'
const router = express.Router()


import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { ROLES } from '../constants';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import createUserValidator from '../validators/create-user-validator';
import updateUserValidator from '../validators/update-user.validator';


const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger);

router.route('/')
.get(authenticate, canAccess([ROLES.ADMIN]), (req: Request, res: Response, next: NextFunction) => {
    void userController.getAll(req, res, next)
})
.post(
    authenticate,
    canAccess([ROLES.ADMIN]),
    createUserValidator,
    (req: Request, res: Response, next: NextFunction) => {
        void userController.create(req, res, next)
    }
)

router.route("/:id").get(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
    void userController.getOne(req, res, next)
}).patch(authenticate, canAccess([ROLES.ADMIN]), updateUserValidator, (req: Request, res: Response, next: NextFunction) => {
    void userController.update(req, res, next)
}).delete(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
    void userController.delete(req, res, next)
})



export default router
