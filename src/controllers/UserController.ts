import { NextFunction,  Request,  Response } from "express";
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
            
            const result = validationResult(req)
            if (!result.isEmpty()) {
                res.status(400).json({ errors: result.array() })
                return
            }

            const {firstName, lastName , email, password, tenantId } = req.body;
            
            this.logger.info('Creating a new Manager', {email})

            const user = await this.userService.create({firstName, lastName , email, password, role: ROLES.MANAGER, tenantId })
            this.logger.info('Manager created successfully', {id: user.id})

            res.status(201).json({id: user.id})
        } catch (error) {
            next(error)
            return
        }
    }
    async update(req: RegisterUserRequest, res: Response, next: NextFunction) {

        const result = validationResult(req)
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() })
            return
        }

        const userId = Number(req.params.id)
        if(isNaN(userId)) {
            const err = createHttpError(400, "Invalid url param");
            next(err);
            return
        }

        const {firstName, lastName} =  req.body;

        this.logger.debug("Request for updating a user", {firstName, lastName})
        try {
            await this.userService.update(userId, {firstName, lastName})
            this.logger.info("User has been updated", { id: userId });
            res.status(201).json({id: userId})
        } catch (error) {
            next(error)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.userService.getAll()
            this.logger.info("All users have been fetched");
            res.status(200).json(users)
        } catch (error) {
            next(error)
        }
    }
    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = Number(req.params.id)
            if(isNaN(userId)) {
                const err = createHttpError(400, "Tenant does not exist");
                next(err);
                return
            }
            const user = await this.userService.getById(userId)
            if (!user) {
                next(createHttpError(400, "User does not exist."));
                return;
            }
            this.logger.info("user has been fetched");
            res.status(200).json({
                user
            })
        } catch (error) {
            next(error)
        }
    }
    async delete(req: Request, res: Response, next: NextFunction) {
        try {

            const userId = Number(req.params.id)
            if(isNaN(userId)) {
                const err = createHttpError(400, "Tenant does not exist");
                next(err);
                return
            }

            await this.userService.deleteById(userId)
            this.logger.info("Tenant has been deleted", {
                id: Number(userId),
            });
            res.status(200).json({ id: Number(userId) });
        } catch (error) {
            next(error)
        }
    }
}