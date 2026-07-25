import { IsNotEmpty, IsString, IsEmail, Matches } from "class-validator";

export class CustomerDTO {
    @IsNotEmpty({ message: "Username is required" })
    @IsString({ message: "Name must contain only Alphabets" })
    @Matches(/^[A-Za-z]+$/, { message: "Name must contain only Alphabets" })
    username: string;

    @IsNotEmpty({ message: "Full name is required" })
    @IsString({ message: "Name must contain only letters and spaces" })
    @Matches(/^[A-Za-z\s]+$/, { message: "Full name must contain only letters and spaces" })
    fullName: string;

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

    @IsNotEmpty({ message: "Phone number is required" })
    @IsString()
    phoneNumber: string;

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