import { Injectable } from "@nestjs/common";
import * as argon2 from "argon2";

@Injectable()
export class ArgonService {
  constructor() {}

  async hash(password: string) {
    return await argon2.hash(password);
  }

  async verifyHash(hash: string, password: string) {
    return await argon2.verify(hash, password);
  }
}
