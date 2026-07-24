import { Controller, Get, Post, Body, Put, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { DealerService } from './dealer.service';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';

@Controller('dealer')
export class DealerController {
  constructor(private readonly dealerService: DealerService) { }

  @Post('createdealer')
  @UsePipes(new ValidationPipe())
  createDealer(@Body() dealerData: DealerDTO): Promise<Dealer> {
    return this.dealerService.createDealer(dealerData);
  }

  @Put('updatephone/:id')
  @UsePipes(new ValidationPipe())
  updatePhone(
    @Param('id') id: string,
    @Body() dealerData: DealerDTO,
  ): Promise<Dealer | null> {
    return this.dealerService.updatePhone(Number(id), dealerData);
  }

  @Get('nullfullname')
  getDealersWithNoName(): Promise<Dealer[]> {
    return this.dealerService.getDealersWithNoName();
  }

  @Delete(':id')
  deleteDealer(@Param('id') id: string): Promise<void> {
    return this.dealerService.deleteDealer(Number(id));
  }

  @Get('all')
  getAllDealers(): Promise<Dealer[]> {
    return this.dealerService.getAllDealers();
  }

  @Post('placeorder')
  placeOrder(@Body() orderData: any) {
    return this.dealerService.placeOrder(orderData);
  }

  @Get('trackorder/:id')
  trackOrderStatus(@Param('id') id: string) {
    return this.dealerService.trackOrderStatus(Number(id));
  }
}