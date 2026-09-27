import { CustomerEntity } from '../../customer/customer.entity';
import { Dealer } from '../../dealer/dealer.entity';
import { SupplierEntity } from '../../supplier/supplier.entity';
import { AdminEntity } from '../../admin/admin.entity';

export type UserRole = 'customer' | 'dealer' | 'supplier' | 'admin';

export interface UserAccountProfile {
  id?: number;
  userName?: string;
  email?: string;
  role: UserRole;
  isActive: boolean;
}

export abstract class UserFactory {
  abstract createUser(data: Partial<UserAccountProfile>): UserAccountProfile;
}

export class ConcreteUserFactory extends UserFactory {
  createUser(data: Partial<UserAccountProfile>): UserAccountProfile {
    const role: UserRole = (data.role || 'customer').toLowerCase() as UserRole;

    switch (role) {
      case 'dealer':
        return {
          id: data.id,
          userName: data.userName || 'Dealer Account',
          email: data.email,
          role: 'dealer',
          isActive: true,
        };
      case 'supplier':
        return {
          id: data.id,
          userName: data.userName || 'Supplier Account',
          email: data.email,
          role: 'supplier',
          isActive: true,
        };
      case 'admin':
        return {
          id: data.id,
          userName: data.userName || 'Admin Account',
          email: data.email,
          role: 'admin',
          isActive: true,
        };
      case 'customer':
      default:
        return {
          id: data.id,
          userName: data.userName || 'Customer Account',
          email: data.email,
          role: 'customer',
          isActive: true,
        };
    }
  }
}
