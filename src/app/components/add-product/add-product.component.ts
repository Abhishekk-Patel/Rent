import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  selectedImages: string[] = [];

  constructor(private fb: FormBuilder, private router: Router, public readonly myCartService: MyCartServiceService) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      rent: ['', Validators.required],
      quantity: ['', Validators.required],
      valid_until: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      userRole: ['', Validators.required]
    });
  }
 
  ngOnInit(): void {
    this.myCartService.setIsAddNewProduct(true);
  }
  
  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = [];
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          this.selectedImages.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onSubmit() {
    if (this.productForm.valid && this.selectedImages.length >= 3) {
      const productData = {
        ...this.productForm.value,
        display_img_urls: this.selectedImages
      };
      console.log('Product added successfully', productData);
      this.myCartService.openProductDetails(productData);
    }
  }
}
