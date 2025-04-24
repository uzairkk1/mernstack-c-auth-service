import { NextFunction,  Request,  Response } from "express";
import { TenantService } from "../services/TenantService";
import { RegisterUserRequest } from "../types";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { UserService } from "../services/UserService";
import { ROLES } from "../constants";

export class UserController {
    constructor(private userService: UserService, private logger: Logger){}
    async create(req: RegisterUserRequest, res: Response, next: NextFunction) {

        try {
            const {firstName, lastName , email, password, } = req.body;
            
            const user = await this.userService.create({firstName, lastName , email, password, role: ROLES.MANAGER })
            res.status(201).json({id: user.id})
        } catch (error) {
            next(error)
            return
        }
        

        // const result = validationResult(req)
        // if (!result.isEmpty()) {
        //     res.status(400).json({ errors: result.array() })
        //     return
        // }

        // const {name, address} =  req.body;
        // this.logger.debug("Request for creating a new tennat", {name, address})
        // try {
        //     const tenant = await this.tenantService.create({name, address})
        //     this.logger.info("Tenant has been created successfully", {id: tenant.id})
        //     res.status(201).json({id: tenant.id})
        // } catch (error) {
        //     next(error)
        // }
    }
    // async update(req: CreateTenantRequest, res: Response, next: NextFunction) {

    //     const result = validationResult(req)
    //     if (!result.isEmpty()) {
    //         res.status(400).json({ errors: result.array() })
    //         return
    //     }

    //     const tenantId = Number(req.params.id)
    //     if(isNaN(tenantId)) {
    //         const err = createHttpError(400, "Invalid url param");
    //         next(err);
    //         return
    //     }

    //     const {name, address} =  req.body;
    //     this.logger.debug("Request for updating a tennat", {name, address})
    //     try {
    //         await this.tenantService.update(tenantId, {name, address})
    //         this.logger.info("Tenant has been updated", { id: tenantId });
    //         res.status(201).json({id: tenantId})
    //     } catch (error) {
    //         next(error)
    //     }
    // }

    // async getAll(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const tenants = await this.tenantService.getAll()
    //         this.logger.info("All tenant have been fetched");
    //         res.status(200).json(tenants)
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    // async getOne(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const tenantId = Number(req.params.id)
    //         if(isNaN(tenantId)) {
    //             const err = createHttpError(400, "Tenant does not exist");
    //             next(err);
    //             return
    //         }
    //         const tenant = await this.tenantService.getById(tenantId)
    //         if (!tenant) {
    //             next(createHttpError(400, "Tenant does not exist."));
    //             return;
    //         }
    //         this.logger.info("Tenant has been fetched");
    //         res.status(200).json({
    //             tenant
    //         })
    //     } catch (error) {
    //         next(error)
    //     }
    // }
    // async delete(req: Request, res: Response, next: NextFunction) {
    //     try {

    //         const tenantId = Number(req.params.id)
    //         if(isNaN(tenantId)) {
    //             const err = createHttpError(400, "Tenant does not exist");
    //             next(err);
    //             return
    //         }

    //         await this.tenantService.deleteById(tenantId)
    //         this.logger.info("Tenant has been deleted", {
    //             id: Number(tenantId),
    //         });
    //         res.status(200).json({ id: Number(tenantId) });
    //     } catch (error) {
    //         next(error)
    //     }
    // }
}