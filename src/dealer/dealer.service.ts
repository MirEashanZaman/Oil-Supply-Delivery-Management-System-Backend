import { Injectable, NotFoundException } from '@nestjs/common';

export interface Dealer {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'inactive' | 'suspended';
  joinedAt: string;
}

export interface DealerProduct {
  id: string;
  dealerId: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
}

export interface DealerPerformance {
  dealerId: string;
  totalSales: number;
  totalOrders: number;
  averageRating: number;
  period: string;
}

@Injectable()
export class DealerService {
  // Mock in-memory data — replace with DB/repository calls in production
  private readonly dealers: Dealer[] = [
    { id: 'd1', name: 'AutoWorld Motors', region: 'north', status: 'active', joinedAt: '2022-01-15' },
    { id: 'd2', name: 'SpeedTrade Dealers', region: 'south', status: 'inactive', joinedAt: '2021-06-10' },
    { id: 'd3', name: 'Metro Auto Hub', region: 'north', status: 'suspended', joinedAt: '2023-03-22' },
  ];

  private readonly products: DealerProduct[] = [
    { id: 'p1', dealerId: 'd1', name: 'Sedan X200', sku: 'SX200', stock: 12, price: 25000 },
    { id: 'p2', dealerId: 'd1', name: 'SUV Z500', sku: 'SZ500', stock: 5, price: 38000 },
    { id: 'p3', dealerId: 'd2', name: 'Truck T100', sku: 'TT100', stock: 8, price: 30000 },
  ];

  private readonly performanceRecords: DealerPerformance[] = [
    { dealerId: 'd1', totalSales: 540000, totalOrders: 21, averageRating: 4.6, period: 'last-30-days' },
    { dealerId: 'd2', totalSales: 120000, totalOrders: 6, averageRating: 3.9, period: 'last-30-days' },
  ];

  /**
   * Returns dealers, optionally filtered by region and/or status.
   */
  findAllDealers(region?: string, status?: string): Dealer[] {
    let result = this.dealers;

    if (region) {
      result = result.filter(
        (dealer) => dealer.region.toLowerCase() === region.toLowerCase(),
      );
    }

    if (status) {
      result = result.filter(
        (dealer) => dealer.status.toLowerCase() === status.toLowerCase(),
      );
    }

    return result;
  }

  /**
   * Returns a single dealer by ID, throws 404 if not found.
   */
  findDealerById(id: string): Dealer {
    const dealer = this.dealers.find((d) => d.id === id);
    if (!dealer) {
      throw new NotFoundException(`Dealer with ID "${id}" not found`);
    }
    return dealer;
  }

  /**
   * Returns all products/inventory belonging to a specific dealer.
   * Supports optional filtering by minimum stock via query param.
   */
  findProductsByDealerId(dealerId: string, minStock?: number): DealerProduct[] {
    // Ensure dealer exists before listing products
    this.findDealerById(dealerId);

    let dealerProducts = this.products.filter((p) => p.dealerId === dealerId);

    if (minStock !== undefined) {
      dealerProducts = dealerProducts.filter((p) => p.stock >= minStock);
    }

    return dealerProducts;
  }

  /**
   * Returns performance/summary metrics for a specific dealer.
   */
  findPerformanceByDealerId(dealerId: string): DealerPerformance {
    this.findDealerById(dealerId);

    const performance = this.performanceRecords.find(
      (p) => p.dealerId === dealerId,
    );

    if (!performance) {
      throw new NotFoundException(
        `No performance data available for dealer "${dealerId}"`,
      );
    }

    return performance;
  }
}