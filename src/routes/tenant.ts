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


const tenantRepository = AppDataSource.getRepository(Tenant)
const tenantService = new TenantService(tenantRepository)
const tenantController = new TenantController(tenantService, logger);

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) => {
        return tenantController.create(req, res, next)
    }
)

export default router
