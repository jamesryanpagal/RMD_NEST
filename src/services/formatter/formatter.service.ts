import { Injectable } from "@nestjs/common";

export const enum LOCALE {
  PH = "en-PH",
}

export const enum CURRENCY {
  PHP = "PHP",
}

export type CurrencyParserProps = {
  style: string;
  currency: CURRENCY;
  minimumFractionDigits: number;
};

@Injectable()
export class FormatterService {
  private currencyParser = new Intl.NumberFormat(LOCALE.PH, {
    style: "currency",
    currency: CURRENCY.PHP,
    minimumFractionDigits: 2,
  });

  onParseToPhp(val: number) {
    return this.currencyParser.format(val);
  }

  onTruncateNumber(val: number, decimals: number = 2) {
    const factor = Math.pow(10, decimals);
    return Math.trunc(val * factor) / factor;
  }
}
