import { UserFullDetailsProps } from "src/type";

declare global {
  namespace Express {
    interface Request {
      user?: UserFullDetailsProps;
      id?: string;
    }
  }
}
