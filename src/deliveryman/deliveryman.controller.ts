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
import { diskStorage, MulterError } from 'multer';

@Controller('deliveryman')
export class DeliverymanController {
    constructor(private readonly deliverymanService: DeliverymanService) { }

    @Get('all')
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

    @Put('orders/:orderId/accept')
    acceptOrder(
        @Param('orderId') orderId: string,
        @Body('deliverymanId') deliverymanId: number,
    ) {
        return this.deliverymanService.acceptOrder(Number(orderId), Number(deliverymanId));
    }

    @Put('orders/:orderId/complete')
    completeDelivery(
        @Param('orderId') orderId: string,
        @Body('deliverymanId') deliverymanId: number,
    ) {
        return this.deliverymanService.completeDelivery(Number(orderId), Number(deliverymanId));
    }

    @Patch(':id')
    @UseInterceptors(
        FileInterceptor('photo', {
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
        }),
    )
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
