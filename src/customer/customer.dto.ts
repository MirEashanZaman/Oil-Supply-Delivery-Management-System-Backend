import { IsNotEmpty, IsString, IsEmail, Matches } from "class-validator";

export class CustomerDTO {
    @IsNotEmpty()
    @IsString({ message: "Name must contain only Alphabets" })
    @Matches(/^[A-Za-z]+$/, { message: "Name must contain only Alphabets" })
    username?: string;

    @IsNotEmpty()
    @IsString({ message: "Name must contain only letters and spaces" })
    @Matches(/^[A-Za-z\s]+$/, { message: "Full name must contain only letters and spaces" })
    fullName?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    email?: string;

    password?: string;
    filename?: string;
    isActive?: boolean;

    @IsNotEmpty({ message: "NID can't be empty" })
    @Matches(/^\d{10,17}$/, { message: "NID must be 10–17 digits" })
    nid?: string;
}