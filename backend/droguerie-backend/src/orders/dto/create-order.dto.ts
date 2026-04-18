import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateOrderDto {
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
    @IsNotEmpty({ message: 'L\'adresse email est obligatoire' })
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    invoiceReference?: string;

    @IsNumber()
    @IsNotEmpty()
    totalPrice: number;

    @IsArray()
    @IsNotEmpty()
    items: any[];
}
