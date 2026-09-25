import { Controller, Get, Post, Body, Put, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { DealerService } from './dealer.service';
import { Dealer } from './dealer.entity';
import { DealerDTO } from './dealer.dto';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError, diskStorage } from 'multer';

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
  placeOrder(@Body() orderData: any, @Req() req: Request) {
    return this.dealerService.placeOrder(orderData, (req as any).user.email);
  }

  @Get('trackorder/:id')
  trackOrderStatus(@Param('id') id: string) {
    return this.dealerService.trackOrderStatus(Number(id));
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('photo', {
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/i)) {
        cb(null, true);
      } else {
        cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'photo'), false);
      }
    },
    limits: { fileSize: 30 * 1024 * 1024 },
    storage: diskStorage({
      destination: './uploads',
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      },
    }),
  }))
  patchDealer(
    @Param('id') id: string,
    @Body() data: Partial<DealerDTO>,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const payload = { ...data };
    if (file?.filename) {
      payload.filename = file.filename;
    }
    return this.dealerService.patchDealer(Number(id), payload);
  }

  @Post(':id/upload-photo')
  @UseInterceptors(FileInterceptor('photo', {
    fileFilter: (req, file, cb) => {
      if (file.originalname.match(/^.*\.(jpg|webp|png|jpeg)$/i)) {
        cb(null, true);
      } else {
        cb(new MulterError('LIMIT_UNEXPECTED_FILE', 'photo'), false);
      }
    },
    limits: { fileSize: 30 * 1024 * 1024 },
    storage: diskStorage({
      destination: './uploads',
      filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
      },
    }),
  }))
  uploadDealerPhoto(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.filename) {
      return { error: 'No image uploaded' };
    }
    return this.dealerService.patchDealer(Number(id), { filename: file.filename });
  }

  @Post('send-email')
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('text') text: string,
  ) {
    return this.dealerService.sendEmail(to, subject, text);
  }

  @Put('confirmorder/:id')
  confirmOrder(@Param('id') id: string, @Body('status') status?: string) {
    return this.dealerService.confirmOrder(Number(id), status);
  }

  @Post('scheduledelivery')
  scheduleDelivery(@Body('orderId') orderId: number, @Body('deliveryDate') deliveryDate: string) {
    return this.dealerService.scheduleDelivery(orderId, deliveryDate);
  }
}