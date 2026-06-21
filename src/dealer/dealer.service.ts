import { Injectable } from "@nestjs/common";

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
}