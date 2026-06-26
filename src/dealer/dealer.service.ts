import { Injectable } from "@nestjs/common";
import { DealerDTO } from "./dealer.dto";

@Injectable()
export class DealerService {
  getDealer(): string {
    return "Dealer";
  }

  getAllDealer(): object {
    return { name: "Dealer", id: "1" };
  }

  getDealerByID(id: number, name: string): object {
    return { name: name, id: id };
  }

  getDealerByIDandName(id: number, name: string): object {
    return { name: name, id: id };
  }

  updateDealer(id: number, dealerData: DealerDTO): object {
    return { message: "Dealer updated", id, data: dealerData };
  }
}