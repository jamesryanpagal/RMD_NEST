import { Injectable } from "@nestjs/common";
import { CreateAccountAdminServiceDto, LoginServiceDto } from "./dto";
import { ExceptionService } from "src/services/interceptor/interceptor.service";
import { PrismaService } from "src/services/prisma/prisma.service";
import { ArgonService } from "src/services/argon/argon.service";

@Injectable()
export class AuthService {
  constructor(
    private exceptionService: ExceptionService,
    private prismaService: PrismaService,
    private argonService: ArgonService,
  ) {}

  login(dto: LoginServiceDto) {
    return dto;
  }

  async createAccountAdmin({
    firstName,
    middleName,
    lastName,
    email,
    password,
    phone,
    mobile,
    houseNumber,
    street,
    barangay,
    subdivision,
    city,
    province,
    region,
    zip,
  }: CreateAccountAdminServiceDto) {
    try {
      const hashPassword = await this.argonService.hash(password);
      await this.prismaService.user.create({
        data: {
          firstName,
          middleName,
          lastName,
          email,
          password: hashPassword,
          phone,
          mobile,
          houseNumber,
          street,
          barangay,
          subdivision,
          city,
          province,
          region,
          zip,
          role: "ADMIN",
        },
      });

      return "Account Created Successfully";
    } catch (error) {
      throw error;
    }
  }
}
