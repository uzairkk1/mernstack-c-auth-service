import express, {  NextFunction, Request, Response } from 'express'
const router = express.Router()

import { TenantController } from '../controllers/TenantController'
import { TenantService } from '../services/TenantService';
import { AppDataSource } from '../config/data-source';
import { Tenant } from '../entity/Tenant';
import logger from '../config/logger';
import authenticate from '../middlewares/authenticate';
import { canAccess } from '../middlewares/canAccess';
import { ROLES } from '../constants';
import tennatValidator from '../validators/tennat-validator';


const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger);

router.route('/').get(authenticate, canAccess([ROLES.ADMIN]), (req: Request, res: Response, next: NextFunction) => {
    return tenantController.getAll(req, res, next)
}).post(
    authenticate,
    canAccess([ROLES.ADMIN]),
    tennatValidator,
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.create(req, res, next)
    }
)

router.route("/:id").get(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
    return tenantController.getOne(req, res, next)
}).patch(authenticate, canAccess([ROLES.ADMIN]), tennatValidator, (req: Request, res: Response, next: NextFunction) => {
    return tenantController.update(req, res, next)
}).delete(authenticate, canAccess([ROLES.ADMIN]), (req, res, next) => {
    return tenantController.delete(req, res, next)
})



export default router
