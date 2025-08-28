import { Prisma } from "generated/prisma";

export type UserFullDetailsProps = Prisma.UserGetPayload<{
  include: {
    admin: true;
    secretary: true;
  };
}>;
