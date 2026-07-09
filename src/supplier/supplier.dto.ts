import { IsNotEmpty, IsString, Matches, MinLength, } from "class-validator";

export class SupplierDTO {
    @IsNotEmpty()
    @IsString()
    @Matches(/^[A-Za-z\s]+$/, { message: "Name must not contain any special character", })
    name?: string;

    @IsNotEmpty()
    @MinLength(6, { message: "Password must be at least 6 characters long", })
    @Matches(/^(?=.*[a-z]).{6,}$/, { message: "Password must contain at least one lowercase character", })
    password?: string;


    filename?: string;

    @IsNotEmpty()
    @Matches(/^01\d{9}$/, { message: "Phone number must start with 01 and be 11 digits", })
    phone?: string;

}
