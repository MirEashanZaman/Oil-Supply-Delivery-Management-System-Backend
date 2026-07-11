import { IsNotEmpty, IsOptional, IsString, IsBoolean, Matches } from "class-validator";

export class DealerDTO {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\d+$/, { message: "Phone number must contain only numbers" })
    phone?: string;
}
