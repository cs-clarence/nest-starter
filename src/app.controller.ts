import { AppService } from "$app.service";
import { Controller, Get, Param } from "@nestjs/common";

@Controller("app")
export class AppController {
  constructor(private appService: AppService) {}

  @Get(":name")
  async getHello(@Param("name") param: string) {
    return { message: this.appService.getHello(param) };
  }

  @Get()
  async get() {
    return "Hello, Nigger";
  }
}
