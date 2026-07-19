import { IsNotEmpty, IsOptional, IsString, IsBoolean, Matches, IsEmail } from "class-validator";

export class DealerDTO {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: "Phone number must contain only numbers" })
    phone?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email input must contain @ and .xyz domain" })
    @Matches(/^[^\s@]+@[^\s@]+\.xyz$/i, { message: "Email input must contain @ and .xyz domain" })
    email?: string;

    password?: string;
    filename?: string;

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
