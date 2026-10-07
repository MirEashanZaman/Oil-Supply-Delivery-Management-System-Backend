import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { DeliverymanService } from './deliveryman.service';
import { DeliverymanDTO } from './deliveryman.dto';
import { AuthGuard } from '../customer/auth/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { createSecureUploadOptions } from '../common/upload-security';

@Controller('deliveryman')
export class DeliverymanController {
    constructor(private readonly deliverymanService: DeliverymanService) { }

    @Get('all')
    @UseGuards(AuthGuard)
    getAllDeliverymen() {
        return this.deliverymanService.getAllDeliverymen();
    }

    @Get('orders/nearby')
    async getNearbyOrders(
        @Query('address') address?: string,
        @Query('radius') radius?: string,
    ) {
        const radiusKm = radius ? Math.max(1, Number(radius)) : 50;
        return this.deliverymanService.getNearbyOrders(address, radiusKm);
    }

    @Get('orders/my/:id')
    getMyDeliveries(@Param('id') id: string) {
        return this.deliverymanService.getMyDeliveries(Number(id));
    }

    @Get(':id')
    getDeliverymanById(@Param('id') id: string) {
        return this.deliverymanService.getDeliverymanById(Number(id));
    }

    @Put('location/ping')
    @UseGuards(AuthGuard)
    updateLocation(
        @Body('deliverymanId') deliverymanId: number,
        @Body('latitude') latitude: number,
        @Body('longitude') longitude: number,
    ) {
        return this.deliverymanService.updateLocation(Number(deliverymanId), Number(latitude), Number(longitude));
    }

    @Put('orders/:orderId/accept')
    @UseGuards(AuthGuard)
    acceptOrder(
        @Param('orderId') orderId: string,
        @Body('deliverymanId') deliverymanId: number,
    ) {
        return this.deliverymanService.acceptOrder(Number(orderId), Number(deliverymanId));
    }

    @Put('orders/:orderId/complete')
    @UseGuards(AuthGuard)
    completeDelivery(
        @Param('orderId') orderId: string,
        @Body('deliverymanId') deliverymanId: number,
        @Body('otp') otp?: string,
        @Body('signature') signature?: string,
        @Body('meterReadingPhoto') meterReadingPhoto?: string,
    ) {
        return this.deliverymanService.completeDelivery(Number(orderId), Number(deliverymanId), {
            otp,
            signature,
            meterReadingPhoto,
        });
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('photo', createSecureUploadOptions('photo', 10 * 1024 * 1024)))
    patchDeliveryman(
        @Param('id') id: string,
        @Body() data: Partial<DeliverymanDTO>,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const payload = { ...data };
        if (file?.filename) {
            payload.filename = file.filename;
        }
        return this.deliverymanService.patchDeliveryman(Number(id), payload);
    }
}
