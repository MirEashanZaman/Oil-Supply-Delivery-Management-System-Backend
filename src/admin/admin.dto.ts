import {
    IsString,
    MaxLength,
    IsNotEmpty,
    IsEmail,
    Matches,
    MinLength,
} from "class-validator";

export class AdminDTO {
    @IsNotEmpty({ message: "Country is required" })
    @IsString({ message: "Country must be a string" })
    @MaxLength(30, {
        message: "Country cannot exceed 30 characters",
    })
    country?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .com domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.com$/i, { message: "Email input must contain @ and .com domain" })
    email?: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password?: string;

    filename?: string;
    adminId?: string;

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