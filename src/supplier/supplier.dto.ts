import { IsIn, IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min, IsEmail, MinLength } from "class-validator";

export class SupplierDTO {
    @IsNotEmpty({ message: "Full name is required" })
    @IsString()
    @MaxLength(100)
    @Matches(/^[A-Za-z\s]+$/, { message: "Name must not contain any special character", })
    fullname?: string;

    @IsNotEmpty({ message: "Age is required" })
    @IsInt()
    @Min(0, { message: "Age cannot be less than 0 ", })
    age?: number;

    @IsNotEmpty({ message: "Status is required" })
    @IsIn(['active', 'inactive'])
    status?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .com domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.com$/i, { message: "Email input must contain @ and .com domain" })
    email?: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password?: string;

    @IsNotEmpty({ message: "Filename is required" })
    @IsString()
    filename?: string;

    supplierId?: string;

    @IsNotEmpty({ message: "Phone number is required" })
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty({ message: "Username is required" })
    @IsString()
    userName?: string;

    @IsNotEmpty({ message: "Address is required" })
    @IsString()
    address?: string;

    @IsNotEmpty({ message: "Title is required" })
    @IsString()
    title?: string;

    @IsNotEmpty({ message: "NID can't be empty" })
    @Matches(/^\d{10,17}$/, { message: "NID must be 10–17 digits" })
    nid?: string;
}

export class loginDTO {
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail()
    email?: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password?: string;
}
