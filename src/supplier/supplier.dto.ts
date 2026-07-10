import { IsIn, IsInt, IsNotEmpty, IsString, Matches, MaxLength, Min, IsOptional } from "class-validator";

export class SupplierDTO {
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @Matches(/^[A-Za-z\s]+$/, { message: "Name must not contain any special character", })
    fullname?: string;

    @IsNotEmpty()
    @IsInt()
    @Min(0, { message: "Age cannot be less than 0 ", })
    age?: number;


    @IsOptional()
    @IsIn(['active', 'inactive'])
    status?: string;

}
