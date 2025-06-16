"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const app_module_1 = require("./app.module");
const jwt_quard_1 = require("./common/guards/jwt-quard");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalGuards(new jwt_quard_1.JwtAuthGuard(app.get(jwt_1.JwtService)));
    app.enableCors();
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 App running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map