import {
    IsOptional,
    IsString,
    MaxLength,
    IsNotEmpty,
    IsEmail,
    Matches,
} from "class-validator";

export class AdminDTO {
    @IsOptional()
    @IsString({ message: "Country must be a string" })
    @MaxLength(30, {
        message: "Country cannot exceed 30 characters",
    })
    country?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    email?: string;

    password?: string;
    filename?: string;

    @IsOptional()
    @IsString()
    adminId?: string;

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