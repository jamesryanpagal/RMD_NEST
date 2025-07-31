import { Injectable } from "@nestjs/common";

@Injectable()
export class GeneratorService {
  constructor() {}

  onGenerateHash(length: number) {
    return Array(length)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join("");
  }
}
