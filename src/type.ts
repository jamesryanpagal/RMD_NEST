import { Prisma } from "generated/prisma";

// export type UserFullDetailsProps = Prisma.UserGetPayload<{
//   include: {
//     address: true;
//     citizen: {
//       include: {
//         household: true;
//       };
//     };
//     partner: {
//       include: {
//         employees: true;
//         working_schedule: true;
//       };
//     };
//     center: {
//       include: {
//         employees: true;
//       };
//     };
//     auth_session: true;
//   };
// }>;

export type UserFullDetailsProps = Prisma.UserGetPayload<{
  include: {
    admin: true;
    secretary: true;
  };
}>;
