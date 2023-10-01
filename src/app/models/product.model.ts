import { IProductInventory } from "./product-inventory.model";

export interface IProduct{
    "id": number;
    "name": string,
    "detail": string,
    "price": number,
    "inventory": IProductInventory,
    "isDetailShown": boolean
}