import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'bad-words';
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  selectedImages: string[] = [];
  userHistory: any[] = [];
  categories: string[] = [];

  brideCategories = [
    'Bridal Lehenga',
    'Bridal Saree',
    'Bridal Jewelry Set',
    'Bridal Shoes',
    'Bridal Accessories',
    'Bridal Makeup',
    'Bridal Clutches',
    'Bridal Dupatta',
    'Bridal Gown',
    'Bridal Handbags',
    'Other',
  ];

  groomCategories = [
    'Groom’s Sherwani',
    'Groom’s Kurta',
    'Groom’s Footwear',
    'Groom’s Tech',
    'Groom’s Suit',
    'Groom’s Accessories',
    'Groom’s Watches',
    'Groom’s Ties',
    'Other',
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public readonly myCartService: MyCartServiceService,
    private userService: UserService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.productForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          this.nonNumericValidator,
          this.inappropriateWordsValidator
        ],
      ],
      rent: ['', Validators.required],
      quantity: [1, Validators.required],
      valid_until: [today, Validators.required],
      category: ['', Validators.required],
     
      description: [
        '',
        [
          Validators.required,
          Validators.maxLength(30),
          this.nonNumericValidator,
          this.inappropriateWordsValidator,
        ],
      ],
      userRole: ['', Validators.required],
    });
  }

  nonNumericValidator(control: FormControl) {
    const value = control.value;
    if (value && !isNaN(value)) {
      return { numeric: true };
    }
    return null;
  }

  inappropriateWordsValidator(control: FormControl) {
    const filter = new Filter();
    const value = control.value;

    // If there's a value in the form control
    if (value && filter.isProfane(value)) {
      return { inappropriate: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.myCartService.setIsAddNewProduct(true);
    this.productForm.get('userRole')?.valueChanges.subscribe((userRole) => {
      this.updateCategories(userRole);
    });
  }

  updateCategories(userRole: string): void {
    if (userRole === 'Bride') {
      this.categories = this.brideCategories;
    } else if (userRole === 'Groom') {
      this.categories = this.groomCategories;
    } else {
      this.categories = [];
    }
    this.productForm.get('category')?.reset();
  }

  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = [];
      Array.from(files).forEach((file) => {
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
        display_img_urls: this.selectedImages,
      };
      this.myCartService.openProductDetails(productData);
      this.userService.addUserHistory(productData);
    }
  }

  getUserHistory() {
    return this.userHistory;
  }
}
