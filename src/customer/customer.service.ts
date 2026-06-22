import { Injectable } from "@nestjs/common";
import { CustomerDTO } from "./customer.dto";

@Injectable()
export class CustomerService {
    getCustomer(): string {
        return "Customer";
    }

    getAllCustomer(): object {
        return { name: "Eashan", id: "1" }
    }

    getCustomerByID(id: number, name: string): object {
        return { name: name, id: id }
    }

    getCustomerByIDandName(id: number, name: string): object {
        return { name: name, id: id }
    }

    createCustomer(customerData: CustomerDTO) {
        return customerData;
    }


}
