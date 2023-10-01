import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/services/products.service';
import { forkJoin } from 'rxjs';
import { IProduct } from './models/product.model';
import { IProductInventory } from './models/product-inventory.model';
import { ProductViewType } from './models/common.model';
import { ICart, ICartProduct } from './models/cart.model';
import { CartService } from './services/cart.service';
import { ToastrService } from 'ngx-toastr';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompareComponent } from './component/compare/compare.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  title = 'product-catalog-with-cart';
  products: IProduct[] = [];
  public viewType: ProductViewType = ProductViewType.Grid;
  public viewTypeEnum = ProductViewType;
  fewItemsLeftLimit = 2;
  public cart: ICart = {
    products: [],
    total: 0
  }
  dropdownSettings: IDropdownSettings  = {};
  selectedDropDownItems: any[] = [];
  selectedCompareProduct: IProduct[] = [];

  constructor(private productsService: ProductsService, private cartSetvice: CartService, private toastr: ToastrService, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    let storedViewType = localStorage.getItem('viewType')
    if(storedViewType){
      this.viewType = <ProductViewType>storedViewType;
    }

  
    forkJoin({ inventoryList: this.productsService.getProductsInverotyList(), detailList: this.productsService.getProductsDetailsList() }).subscribe((res: any) => {
      res.detailList.forEach( (detailItem: IProduct) => {
        detailItem.inventory = res.inventoryList.find( (inventoryItem: IProductInventory) => detailItem.id == inventoryItem.id);
      })
      this.products = res.detailList;
      this.cartSetvice.getCartProducts().subscribe(
        (res: ICart) => {
          res.products.forEach((cartItem: ICartProduct) => {
            cartItem.product =this.products.find( (detailItem: IProduct) => detailItem.id == cartItem.id);
          })
          this.cart = res;
        }
      )
    })

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      limitSelection: 3
    };
  }

  showDetails(product: IProduct): void {
    product.isDetailShown = !product.isDetailShown;
  }

  viewChange(e: Event): void {
    localStorage.setItem('viewType', this.viewType);
  }

  addToCart(product: IProduct): void{
    if(this.cart.products.filter( cartProduct => cartProduct.id == product.id).length == 0){
      let cartProduct : ICartProduct = {
        id : product.id,
        product: product,
        purchasedQty: 1
      }
      this.cart.products.push(cartProduct);
      this.decreaseProductQuantity(product);
    } else {
      let cartProduct = this.cart.products.find( cartProduct => cartProduct.id == product.id);
      if(cartProduct){
        if(cartProduct.purchasedQty >= product.inventory.maxQtyPerOrder){
          this.toastr.warning(`You can not add more then ${product.inventory.maxQtyPerOrder} quantity for ${product.name}.`);
          return;
        }
        cartProduct.purchasedQty++;
      } else {
        this.toastr.error('Something went wrong. Please try after some time...');
        return;
      }
      this.decreaseProductQuantity(product);
    }
    this.cartSetvice.updateCart(this.cart).subscribe(() => {
      this.toastr.success(`${product.name} added to cart successfully.`)
    });
  }

  private decreaseProductQuantity(product: IProduct) {
    product.inventory.availableQty--;
    this.cart.total += product.price;
    this.productsService.updateProductQuantity(product).subscribe();
  }

  private increaseProductQuantity(product: ICartProduct) {
    if(product.product){
      product.product.inventory.availableQty += product.purchasedQty;
      this.cart.total -= (product.product?.price * product.purchasedQty);
      this.productsService.updateProductQuantity(product.product).subscribe();
    }
  }

  public removeFromCart(product: ICartProduct): void {
    const index = this.cart.products.findIndex(p => p.id === product.id);
    if (index > -1 && product.product != undefined) {
      this.cart.products.splice(index, 1);
      this.increaseProductQuantity(product);
      this.cartSetvice.updateCart(this.cart).subscribe(() => {
        this.toastr.success(`${product.product?.name} removed from cart successfully.`);
      });
    }
  }

  public onItemSelect(e: any): void {
    let selectedProduct = this.products.find( item => e.id == item.id)
    if(selectedProduct)
    this.selectedCompareProduct.push(selectedProduct);
  }

  public onItemDeSelect(e: any): void { 
    this.selectedCompareProduct = this.selectedCompareProduct.filter(item => item.id != e.id);
  }

  public openCompareModal(): void {
    const modalRef = this.modalService.open(CompareComponent,{ size: 'xl'});
    modalRef.componentInstance.products = this.selectedCompareProduct;

    this.selectedCompareProduct = [];
    this.selectedDropDownItems = [];
  }

}
