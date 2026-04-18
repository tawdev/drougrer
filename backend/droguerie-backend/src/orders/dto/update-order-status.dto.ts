import { IsEnum, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { OrderStatus } from '../order.entity';

export class UpdateOrderStatusDto {
    @IsEnum(OrderStatus, { message: 'Statut invalide' })
    @IsNotEmpty()
    status: OrderStatus;

    @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
    @IsOptional()
    email?: string;
}
