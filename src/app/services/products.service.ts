import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct } from '../models/product.model';
import { IProductInventory } from '../models/product-inventory.model';

const api_products_inventory = 'http://localhost:3000/products_invertory';
const api_products_detalils =  '/assets/product-details.json';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) { }

  public getProductsInverotyList(): Observable<IProductInventory[]> {
    return this.http.get<IProductInventory[]>(api_products_inventory);
  }

  public getProductsDetailsList(): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(api_products_detalils);
  }

  public updateProductQuantity(product: IProduct): Observable<any> {
    return this.http.put(`${api_products_inventory}/${product.id}`, product.inventory);
  }

}
