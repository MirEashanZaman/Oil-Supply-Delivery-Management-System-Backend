import { IsNotEmpty, IsString, Matches, IsDateString, IsUrl } from "class-validator";

export class AdminDTO {

    @IsNotEmpty({ message: "Name is required" })
    @IsString({ message: "Name must be a string" })
    @Matches(/^[^0-9]+$/, {
        message: "Name should not contain any numbers",
    })
    name?: string;

    @IsNotEmpty({ message: "Password is required" })
    @Matches(/^(?=.*[@#$&]).+$/, {
        message: "Password must contain at least one special character (@, #, $, or &)",
    })
    password?: string;

    @IsNotEmpty({ message: "Date is required" })
    @IsDateString({}, {
        message: "Please enter a valid date",
    })
    date?: string;

    @IsNotEmpty({ message: "Social media link is required" })
    @IsUrl({}, {
        message: "Please enter a valid URL",
    })
    socialMediaLink?: string;

}