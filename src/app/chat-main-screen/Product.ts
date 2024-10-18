export class Product {


   id: string;
   type: string;
   subtype: string;
   coupon: number;
   underlyings: string[];
   currency: string;
   echeance: string;
   ISIN: string;
   strike_level: number;
   barrier_level: number;
   initial_fixing_date: string;
   final_fixing_date: string;
   total_expense_ratio: number;
   kid_content: string;
   term_content: string;
   version_: number;

  constructor(product: Product) {
    this.id = product.id;
    this.type = product.type;
    this.subtype = product.subtype;
    this.coupon = product.coupon;
    this.underlyings = product.underlyings;
    this.currency = product.currency;
    this.echeance = product.echeance;
    this.ISIN = product.ISIN;
    this.strike_level = product.strike_level;
    this.barrier_level = product.barrier_level;
    this.initial_fixing_date = product.initial_fixing_date;
    this.final_fixing_date = product.final_fixing_date;
    this.total_expense_ratio = product.total_expense_ratio;
    this.kid_content = product.kid_content;
    this.term_content = product.term_content;
    this.version_ = product.version_;
  }

  public format(): string {
    let output: string = "";

    output +=  this.ISIN + "/";
    output +=  this.subtype + "/";
    output +=  this.currency + "/";
    output +=  this.coupon + "/";
    return output;
  }
}

