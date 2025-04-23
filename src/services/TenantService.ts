import { ITenant } from "../types";
import { Repository } from "typeorm";
import { Tenant } from "../entity/Tenant";

export class TenantService {

    constructor(private tenantRepository: Repository<Tenant>){}

    async create(tenantData: ITenant) {
        return await this.tenantRepository.save(tenantData)
    }
}