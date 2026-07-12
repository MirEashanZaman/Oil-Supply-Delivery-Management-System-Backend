import {
    IsOptional,
    IsString,
    MaxLength,
} from "class-validator";

export class AdminDTO {

    @IsOptional()
    @IsString({ message: "Country must be a string" })
    @MaxLength(30, {
        message: "Country cannot exceed 30 characters",
    })
    country?: string;

}