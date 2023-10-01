import { Component, Input } from '@angular/core';
import { IProduct } from 'src/app/models/product.model';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent {
  @Input() products: IProduct[] = [];
  constructor() { }

  public removeProductFromComparison(index: number) {
    this.products.splice(index, 1);
  }
}
