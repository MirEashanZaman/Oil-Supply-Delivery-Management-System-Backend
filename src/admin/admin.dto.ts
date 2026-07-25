import {
    IsString,
    MaxLength,
    IsNotEmpty,
    IsEmail,
    Matches,
} from "class-validator";

export class AdminDTO {
    @IsNotEmpty({ message: "Country is required" })
    @IsString({ message: "Country must be a string" })
    @MaxLength(30, {
        message: "Country cannot exceed 30 characters",
    })
    country: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    email: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    password: string;

    @IsNotEmpty({ message: "Filename is required" })
    @IsString()
    filename: string;

    @IsNotEmpty({ message: "Admin ID is required" })
    @IsString()
    adminId: string;

    @IsNotEmpty({ message: "Phone number is required" })
    @IsString()
    phoneNumber: string;

    @IsNotEmpty({ message: "Username is required" })
    @IsString()
    userName: string;

    @IsNotEmpty({ message: "Address is required" })
    @IsString()
    address: string;

    @IsNotEmpty({ message: "Title is required" })
    @IsString()
    title: string;

    @IsNotEmpty({ message: "NID can't be empty" })
    @Matches(/^\d{10,17}$/, { message: "NID must be 10–17 digits" })
    nid: string;
}

export class loginDTO {
    @IsNotEmpty({ message: "Email is required" })
    @IsEmail()
    email: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    password: string;
}