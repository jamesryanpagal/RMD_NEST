import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/services/prisma/prisma.service";
import { UserFullDetailsProps } from "src/type";
import { SettingsDto } from "./dto";

@Injectable()
export class SettingsService {
  constructor(private prismaService: PrismaService) {}

  async updateTheme(dto: SettingsDto, user?: UserFullDetailsProps) {
    const { id } = user || {};
    const { theme } = dto;
    try {
      await this.prismaService.$transaction(async prisma => {
        const settingsResponse = await prisma.settings.findFirst({
          where: {
            userId: id,
          },
        });

        if (!settingsResponse) {
          await prisma.settings.create({
            data: {
              theme,
              user: {
                connect: { id },
              },
            },
          });
        } else {
          await prisma.settings.update({
            where: {
              id: settingsResponse.id,
            },
            data: {
              theme,
            },
          });
        }
      });
      return "Theme updated successfully.";
    } catch (error) {
      throw error;
    }
  }
}
