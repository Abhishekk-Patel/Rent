import { Component } from '@angular/core';
import { AiService } from 'src/app/service/ai.service';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';


@Component({
  selector: 'app-product-search-ai',
  templateUrl: './product-search-ai.component.html',
  styleUrls: ['./product-search-ai.component.css']
})
export class ProductSearchAiComponent {


  prompt = '';
  loading = false;
  error = '';
  isOpen = false;

  message = '';
  products: any[] = [];

  constructor(private ai: AiService,private mycartService: MyCartServiceService) {}

  toggle() {
    this.isOpen = !this.isOpen;
    this.error = '';
  }

  searchProducts() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.error = '';
    this.products = [];

    this.ai.searchAiProdcuts(this.prompt).subscribe({
      next: (res:any) => {
        this.message = res.message;
        this.products = res.products || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.detail || 'Search failed';
        this.loading = false;
      }
    });
  }

  viewProduct(prodcutDetails:any){
    this.mycartService.openProductDetails(prodcutDetails._id);

    console.log(prodcutDetails._id,'prodcutDetails');

  }

  addtoCart(prodcutDetails:any){
    console.log(prodcutDetails,'prodcutDetails');


  }
}



