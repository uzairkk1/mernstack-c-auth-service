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


const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger);

router.route('/')
// .get(authenticate, canAccess([ROLES.ADMIN]), (req: Request, res: Response, next: NextFunction) => {
//     return tenantController.getAll(req, res, next)
// })
.post(
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => {
        return userController.create(req, res, next)
    }
)

// router.route("/:id").get(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
//     return tenantController.getOne(req, res, next)
// }).patch(authenticate, canAccess([ROLES.ADMIN]), tennatValidator, (req: Request, res: Response, next: NextFunction) => {
//     return tenantController.update(req, res, next)
// }).delete(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
//     return tenantController.delete(req, res, next)
// })



export default router
