import { IsNotEmpty, IsString, IsEmail } from "class-validator";

export class CustomerDTO {
    @IsNotEmpty()
    @IsString({ message: "Name is Invalid" })
    name?: string;
    @IsNotEmpty()
    @IsEmail()
    uname?: number;
    password?: string;
}