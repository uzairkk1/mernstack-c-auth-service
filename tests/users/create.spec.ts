import { DataSource } from "typeorm";
import request from "supertest";
import createJWKSMock from "mock-jwks";

import { AppDataSource } from "../../src/config/data-source";
import app from "../../src/app";
import { ROLES } from "../../src/constants";
import { User } from "../../src/entity/User";

describe("POST /users", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5509");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("Given all fields", () => {
        it("should persist the user in the database", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: ROLES.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Uzair",
                lastName: "kk",
                email: "uzair@mern.space",
                password: "123123123",
                // tenantId: 1,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].email).toBe(userData.email);
        });

        it("should create a manager user", async () => {
            const adminToken = jwks.token({
                sub: "1",
                role: ROLES.ADMIN,
            });

            // Register user
            const userData = {
                firstName: "Uzair",
                lastName: "kk",
                email: "uzair@mern.space",
                password: "123123123",
                // tenantId: 1,
            };

            // Add token to cookie
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminToken}`])
                .send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(ROLES.MANAGER);
        });

        it.todo("should return 403 if non admin user tries to create a user");
    });
});