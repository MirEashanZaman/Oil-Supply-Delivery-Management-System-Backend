import { IsNotEmpty, IsString, IsEmail, Matches } from "class-validator";

export class CustomerDTO {
    @IsNotEmpty()
    @IsString({ message: "Name must contain only Alphabets" })
    @Matches(/^[A-Za-z]+$/, { message: "Name must contain only Alphabets" })
    name?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    uname?: string;

    password?: string;
    filename?: string;

    @IsNotEmpty()
    @Matches(/^\d{10,17}$/, { message: "NID must be 10–17 digits" })
    nid?: string;
}