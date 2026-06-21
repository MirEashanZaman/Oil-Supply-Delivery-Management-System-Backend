import { Controller, Get, Param, Query } from "@nestjs/common";
import { DealerService } from "./dealer.service";

@Controller('dealer')
export class DealerController {
  constructor(private readonly dealerService: DealerService) { }

  @Get()
  getDealer(): string {
    return this.dealerService.getDealer();
  }

  @Get('getalldealer')
  getAllDealer(): object {
    return this.dealerService.getAllDealer();
  }

  @Get('getdealerbyid/:myid/geybyname/:name')
  getDealerByID(@Param('myid') id: number, @Param('name') name: string): object {
    return this.dealerService.getDealerByID(id, name);
  }

  @Get('getdealerbyidandname')
  getDealerByIDandName(@Query('id') id: number, @Query('name') name: string): object {
    return this.dealerService.getDealerByIDandName(id, name);
  }
}