import { Injectable } from '@angular/core';
import { ICart } from '../models/cart.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const api_cart = 'http://localhost:3000/cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient) { }

  public updateCart(cart: ICart): Observable<any> {
    let updatedProducts = cart.products.map(item => {return {...item, product: undefined}});
    let updateCartObj = { ... cart, products: updatedProducts };
    return this.http.put(api_cart, updateCartObj);
  }

  public getCartProducts(): Observable<any> {
    return this.http.get(api_cart);
  }
}
