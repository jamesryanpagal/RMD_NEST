import { Injectable } from "@nestjs/common";
import * as moment from "moment-timezone";

@Injectable()
export class MtzService {
  constructor() {}

  public dateFormat = {
    timezone: "Asia/Manila",
    defaultformat: "YYYY-MM-DD",
    dateAbrev: "ddd",
    monthAbrev: "MMM",
    monthIndex: "M",
    yearMonth: "YYYY-MM",
    dateAbbrev: "MMM D, YYYY",
    fullDateAbbrev: "MMMM D, YYYY",
    time24h: "HH:mm:ss",
    time12h: "hh:mm:ss a",
    time12hDisplay: "h:mm a",
    datetimesec: "YYYY-MM-DD hh:mm A",
    monthDayYear: "MM/DD/YYYY",
    dateTimeUTCZ: "MM/DD/YYYY h:mm:ss A [UTC]Z",
  };

  mtz(
    inp: string | moment.MomentInput = moment(),
    format?: keyof typeof this.dateFormat,
  ) {
    if (!format) {
      return moment.utc(inp).tz(this.dateFormat.timezone);
    }
    return moment
      .utc(inp, this.dateFormat[format])
      .tz(this.dateFormat.timezone);
  }

  generateDateMilliseconds(days: number) {
    return days * 24 * 60 * 60 * 1000;
  }
}
