import { IsNotEmpty, IsString, IsEmail, Matches, MinLength, IsOptional } from "class-validator";

export class DealerDTO {
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .com domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.com$/i, { message: "Email input must contain @ and .com domain" })
    email?: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    @MinLength(8, { message: "Password must be at least 8 characters long" })
    password?: string;

    @IsOptional()
    @IsString({ message: "Photo must be a string" })
    filename?: string;

    @IsNotEmpty({ message: "Phone number is required" })
    @IsString()
    phoneNumber?: string;

    @IsNotEmpty({ message: "Username is required" })
    @IsString()
    userName?: string;

    @IsNotEmpty({ message: "Address is required" })
    @IsString()
    address?: string;

    title?: string;
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
