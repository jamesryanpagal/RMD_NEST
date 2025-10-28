import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  constructor() {}

  checkHealth() {
    return "App is healthy.";
  }
}
