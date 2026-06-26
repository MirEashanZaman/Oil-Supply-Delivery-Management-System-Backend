import { Body, Controller, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { DealerService } from "./dealer.service";
import { DealerDTO } from "./dealer.dto";

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

  @Post('createdealer')
  @UsePipes(new ValidationPipe())
  createDealer(@Body() dealerData: DealerDTO): object {
    return { message: 'Dealer data is valid', data: dealerData };
  }

  @Put('updatedealer/:id')
  updateDealer(@Param('id') id: number, @Body() dealerData: DealerDTO): DealerDTO {
    console.log(dealerData.name)
    return this.dealerService.updateDealer(id, dealerData);
  }
}