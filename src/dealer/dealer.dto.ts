import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class DealerDTO {
    @IsNotEmpty()
    @IsString({ message: "Name is invalid" })
    @Matches(/^[A-Za-z]+$/)
    name?: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Email must be a valid email address" })
    @Matches(/^[^\s@]+@aiub\.edu$/i, { message: "Email must contain aiub.edu domain" })
    email?: string;

    @IsNotEmpty({ message: "Password is required" })
    @MinLength(6, { message: "Password must be at least 6 characters long" })
    @Matches(/^(?=.*[A-Z]).+$/, { message: "Password must contain at least one uppercase character" })
    password?: string;

    @IsNotEmpty({ message: "Gender is required" })
    @Matches(/^(male|female)$/i, { message: "Gender must be male or female" })
    gender?: string;

    @IsNotEmpty({ message: "Phone number is required" })
    @IsString({ message: "Phone number must be a string" })
    @Matches(/^\d+$/, { message: "Phone number must contain only numbers" })
    phone?: string;
}
