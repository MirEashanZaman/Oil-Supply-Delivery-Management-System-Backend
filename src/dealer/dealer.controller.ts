import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  DealerService,
   type Dealer,
 type  DealerProduct,
 type DealerPerformance,
} from './dealer.service';

@Controller('dealers')
export class DealerController {
  constructor(private readonly dealerService: DealerService) {}

  /**
   * GET /dealers
   * GET /dealers?region=north
   * GET /dealers?status=active
   * GET /dealers?region=north&status=active
   *
   * Demonstrates @Query for optional filtering.
   */
  @Get()
  findAll(
    @Query('region') region?: string,
    @Query('status') status?: string,
  ): Dealer[] {
    return this.dealerService.findAllDealers(region, status);
  }

  /**
   * GET /dealers/:id
   *
   * Demonstrates @Param for resource identification.
   */
  @Get(':id')
  findOne(@Param('id') id: string): Dealer {
    return this.dealerService.findDealerById(id);
  }

  /**
   * GET /dealers/:id/products
   * GET /dealers/:id/products?minStock=5
   *
   * Nested resource route — combines @Param (dealer id) with @Query (filter).
   */
  @Get(':id/products')
  findDealerProducts(
    @Param('id') id: string,
    @Query('minStock') minStock?: string,
  ): DealerProduct[] {
    const parsedMinStock = minStock !== undefined ? parseInt(minStock, 10) : undefined;
    return this.dealerService.findProductsByDealerId(id, parsedMinStock);
  }

  /**
   * GET /dealers/:id/performance
   *
   * Dealer performance/summary profile — nested resource, plural-friendly,
   * no verbs in the route.
   */
  @Get(':id/performance')
  findDealerPerformance(@Param('id') id: string): DealerPerformance {
    return this.dealerService.findPerformanceByDealerId(id);
  }
}