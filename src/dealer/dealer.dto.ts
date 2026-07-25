import { IsNotEmpty, IsString, Matches, IsEmail } from "class-validator";

export class DealerDTO {
    @IsNotEmpty({ message: "Full name is required" })
    @IsString()
    fullName: string;

    @IsNotEmpty({ message: "Phone is required" })
    @IsString()
    @Matches(/^\d+$/, { message: "Phone number must contain only numbers" })
    phone: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .com domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.com$/i, { message: "Email input must contain @ and .com domain" })
    email: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    password: string;

    @IsNotEmpty({ message: "Filename is required" })
    @IsString()
    filename: string;

    @IsNotEmpty({ message: "Dealer ID is required" })
    @IsString()
    dealerId: string;

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
