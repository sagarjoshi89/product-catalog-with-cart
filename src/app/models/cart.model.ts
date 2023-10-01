import { IProduct } from "./product.model"
export interface ICartProduct{
    id: number;
    product?: IProduct;
    purchasedQty: number;
}

export interface ICart{
    products: ICartProduct[]
    total: number
}