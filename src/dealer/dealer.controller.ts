import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { DealerService } from './dealer.service';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';

@Controller('dealer')
@UseGuards(AuthGuard)
export class DealerController {
  constructor(private readonly dealerService: DealerService) { }

  @Post('createdealer')
  @UsePipes(new ValidationPipe())
  createDealer(@Body() dealerData: DealerDTO): Promise<Dealer> {
    return this.dealerService.createDealer(dealerData);
  }

  @Post(':id/products')
  async assignProducts(@Param('id') id: string, @Body('productIds') productIds: number[]) {
    return this.dealerService.assignProducts(Number(id), productIds);
  }

  @Get(':id/products')
  async getProducts(@Param('id') id: string) {
    return this.dealerService.getProducts(Number(id));
  }

  @Delete(':id/products/:productId')
  async removeProduct(@Param('id') id: string, @Param('productId') productId: string) {
    return this.dealerService.removeProduct(Number(id), Number(productId));
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

  @Patch(':id')
  patchDealer(@Param('id') id: string, @Body() data: Partial<DealerDTO>) {
    return this.dealerService.patchDealer(Number(id), data);
  }

  @Post('send-email')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    return this.dealerService.sendEmail(to, subject, text);
  }
}