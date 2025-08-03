import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { CookieOptions, Response } from "express";
import { config } from "src/config";
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
      secure: false,
      sameSite: "lax",
      ...(type === "set" && {
        maxAge: this.mtzService.generateDateMilliseconds(7),
      }),
    };

    if (type === "set" && !!token) {
      res.cookie(key, token, options);
    } else {
      res.clearCookie(key, options);
    }
  }
}
