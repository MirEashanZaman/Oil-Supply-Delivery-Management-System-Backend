import { IsIn, IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min, IsOptional, IsEmail } from "class-validator";

export class SupplierDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @Matches(/^[A-Za-z\s]+$/, { message: "Name must not contain any special character", })
    fullname?: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: "Age cannot be less than 0 ", })
    age?: number;


    @IsOptional()
    @IsIn(['active', 'inactive'])
    status?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    email?: string;

    password?: string;
    filename?: string;

    @IsOptional()
    @IsString()
    supplierId?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    userName?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
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
    password?: string;
}
