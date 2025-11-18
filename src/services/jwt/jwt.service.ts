import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CookieOptions, Response } from "express";
import { config, ENVIRONMENT } from "src/config";
import { MtzService } from "../mtz/mtz.service";

export const enum COOKIE_KEY {
  REFRESH_TOKEN = "refresh-token",
}

@Injectable()
export class JwtAuthService {
  constructor(
    private jwtService: JwtService,
    private mtzService: MtzService,
  ) {}

  async signAccessTokenAsync<T extends Buffer | object>(payload: T) {
    return await this.jwtService.signAsync(payload);
  }

  async signRefreshTokenAsync<T extends Buffer | object>(payload: T) {
    return await this.jwtService.signAsync(payload, {
      secret: config.refresh_jwt_secret,
      expiresIn: config.refresh_jwt_expiration,
    });
  }

  manageCookie(
    type: "clear" | "set",
    key: COOKIE_KEY,
    res: Response,
    token?: string,
  ) {
    const options: CookieOptions = {
      httpOnly: true,
      secure: config.environment === "PROD",
      sameSite: "lax",
      path: "/",
      ...(type === "set" && {
        maxAge: this.convertToMilliseconds(config.refresh_jwt_expiration),
      }),
    };

    if (type === "set" && !!token) {
      res.cookie(key, token, options);
    } else {
      res.clearCookie(key, options);
    }
  }

  private convertToMilliseconds(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unsupported time unit: ${unit}`);
    }
  }
}
