export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export interface PartnerLocation {
  id: number;
  name: string;
  role: 'Supplier' | 'Dealer';
  email: string;
  phone?: string;
  address: string;
  coordinates: GeoCoordinate;
  distanceKm?: number;
  estimatedTransitMinutes?: number;
}

export class GeoProximityService {
  private static readonly EARTH_RADIUS_KM = 6371;

  public static calculateHaversineDistanceKm(
    point1: GeoCoordinate,
    point2: GeoCoordinate,
  ): number {
    const lat1Rad = this.toRadians(point1.latitude);
    const lat2Rad = this.toRadians(point2.latitude);
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLng = this.toRadians(point2.longitude - point1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((this.EARTH_RADIUS_KM * c).toFixed(2));
  }

  public static findNearbyPartners(
    customerLocation: GeoCoordinate,
    partners: PartnerLocation[],
    maxRadiusKm: number = 50,
  ): PartnerLocation[] {
    return partners
      .map((partner) => {
        const distanceKm = this.calculateHaversineDistanceKm(
          customerLocation,
          partner.coordinates,
        );
        const estimatedTransitMinutes = Math.max(
          10,
          Math.round((distanceKm / 35) * 60),
        );
        return {
          ...partner,
          distanceKm,
          estimatedTransitMinutes,
        };
      })
      .filter((partner) => (partner.distanceKm ?? Infinity) <= maxRadiusKm)
      .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
  }

  public static geocodeAddress(address?: string): GeoCoordinate {
    if (!address) {
      return { latitude: 23.8103, longitude: 90.4125 };
    }

    const clean = address.toLowerCase();

    if (clean.includes('kuratoi') || clean.includes('kuratoli') || clean.includes('ka 65')) {
      return { latitude: 23.8214, longitude: 90.4273 };
    }
    if (clean.includes('gulshan') || clean.includes('banani')) {
      return { latitude: 23.7925, longitude: 90.4078 };
    }
    if (clean.includes('uttara') || clean.includes('airport')) {
      return { latitude: 23.8759, longitude: 90.3795 };
    }
    if (clean.includes('chittagong') || clean.includes('port') || clean.includes('chattogram')) {
      return { latitude: 22.3569, longitude: 91.7832 };
    }
    if (clean.includes('sylhet')) {
      return { latitude: 24.8949, longitude: 91.8687 };
    }
    if (clean.includes('khulna')) {
      return { latitude: 22.8456, longitude: 89.5403 };
    }
    if (clean.includes('dhanmondi') || clean.includes('mirpur')) {
      return { latitude: 23.7465, longitude: 90.3760 };
    }

    let hash = 0;
    for (let i = 0; i < address.length; i++) {
      hash = address.charCodeAt(i) + ((hash << 5) - hash);
    }
    const offsetLat = ((Math.abs(hash) % 1000) / 10000) * 0.08;
    const offsetLng = (((Math.abs(hash) >> 3) % 1000) / 10000) * 0.08;

    return {
      latitude: Number((23.8103 + offsetLat).toFixed(4)),
      longitude: Number((90.4125 + offsetLng).toFixed(4)),
    };
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
