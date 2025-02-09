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
    const userDetails = localStorage.getItem('userDetails');
    if (!userDetails) {
      this.router.navigate(['']);
    }
    const today = new Date().toISOString().split('T')[0];
    this.productForm = this.fb.group({
      ProductName: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          this.nonNumericValidator,
          this.inappropriateWordsValidator,
        ],
      ],
      ProductRent: ['', Validators.required],
      quantity: [1, Validators.required],
      valid_until: [today, Validators.required],
      category: ['', Validators.required],

      ProductDescription: [
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
    console.log(this.userService.getUserDetails().email, 'userDetails');
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
      const userDetails = this.userService.getUserDetails();
      console.log(userDetails, 'userDetails');
      console.log(userDetails.email, 'userEmail'); // Added line to log user email
      const productData = {
        ...this.productForm.value,
        display_img_urls: this.selectedImages,
        email: userDetails.email, // Add email to product data
      };

      // Log product data for debugging purposes
      console.log(productData, 'productData');

      // Create a FormData object to send all the data, including images
      let formData = new FormData();
      // Frontend formData append - make sure these field names match the ones expected by the BE
      formData.append('productName', productData.ProductName);
      formData.append('productDescription', productData.ProductDescription);
      formData.append('productRent', productData.ProductRent.toString());
      formData.append('category', productData.category);
      formData.append('quantity', productData.quantity.toString());
      formData.append('userRole', productData.userRole);
      formData.append('validUntil', productData.valid_until);
      formData.append('email', productData.email); // Append email to formData

      // Convert each base64 image string to a Blob and append it to formData
      productData.display_img_urls.forEach(
        (imgBase64: string, index: number) => {
          const byteCharacters = atob(imgBase64.split(',')[1]); // Decoding base64
          const byteArrays = [];

          for (let offset = 0; offset < byteCharacters.length; offset++) {
            byteArrays.push(byteCharacters.charCodeAt(offset));
          }

          const blob = new Blob([new Uint8Array(byteArrays)], {
            type: 'image/jpeg',
          }); // Assuming image/jpeg, adjust if needed
          formData.append(`image${index}`, blob, `image${index}.jpg`); // Append blob as a file
        }
      );

      // Logging the form data (you can remove this once you're done testing)
      formData.forEach((value: any, key: string) => {
        console.log(key, 'key', value, 'value');
      });

      // Assuming the method handles the API call
     // this.myCartService.openProductDetails(productData);
      this.myCartService.addProductDetailsApi(formData);

      // Adding user history (if needed)
      this.userService.addUserHistory(formData);
    }
  }

  getUserHistory() {
    return this.userHistory;
  }
}
