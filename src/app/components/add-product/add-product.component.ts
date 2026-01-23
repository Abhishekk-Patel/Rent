import { Component, OnInit, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'bad-words';
 // fixed import style for 'bad-words'
import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { ProductDetailsPopupComponent } from '../product-details-popup/product-details-popup.component';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit {
  isLocating = false;
  isUploading = false;
  productForm: FormGroup;
  selectedImages: string[] = [];
  categories: string[] = [];
  sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
  colorOptions = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Gold', 'Silver', 'Other',
  ];
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
  fullAddressTooltip = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public readonly myCartService: MyCartServiceService,
    private userService: UserService,
    private ngZone: NgZone
  ) {
    const userDetails = localStorage.getItem('userDetails');
    if (!userDetails) {
      this.router.navigate(['']);
    }

    const today = new Date().toISOString().split('T')[0];
    this.productForm = this.fb.group({
      ProductName: ['', [Validators.required, Validators.maxLength(30), this.nonNumericValidator]],
      ProductRent: ['', [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      valid_until: [today, Validators.required],
      category: ['', Validators.required],
      city: ['', Validators.required],
      ProductDescription: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          this.nonNumericValidator,
          this.inappropriateWordsValidator,
        ],
      ],
      userRole: ['', Validators.required],
      productListedDate: [today, Validators.required],
      size: ['', Validators.required],
      color: ['', Validators.required],
      // Personal details
      ownerName: ['', [Validators.required, Validators.maxLength(40)]],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  // Custom validator to disallow purely numeric values for fields like ProductName & Description
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

  detectLocation() {
    this.isLocating = true;
    if (!navigator.geolocation) {
      this.isLocating = false;
      return console.error('Geolocation is not supported by this browser.');
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          this.ngZone.run(() => {
            this.productForm.get('city')?.setValue('Detecting location...');
          });
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await response.json();
          const fullAddress = [data.city, data.locality, data.principalSubdivision, data.postcode, data.countryName]
            .filter(Boolean)
            .join(', ');

          this.ngZone.run(() => {
            this.productForm.get('city')?.setValue(fullAddress);
            this.fullAddressTooltip = fullAddress;
            this.isLocating = false;
          });
        } catch (error) {
          this.ngZone.run(() => {
            this.productForm.get('city')?.setValue('Location detection failed');
            this.isLocating = false;
          });
          console.error('Error fetching location data:', error);
        }
      },
      (error) => {
        this.ngZone.run(() => {
          this.productForm.get('city')?.setValue('Location detection failed');
          this.isLocating = false;
        });
        console.error('Error getting geolocation:', error);
      }
    );
  }

  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.selectedImages = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Only add the image if it loads properly
          if (reader.result) {
            this.selectedImages.push(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  onSubmit() {
    if (this.productForm.valid && this.selectedImages.length >= 3) {
      const userDetails = this.userService.getUserDetails();
      const productData = {
        ...this.productForm.value,
        display_img_urls: this.selectedImages,
        email: userDetails.email,
      };
      const formData = new FormData();
      formData.append('productName', productData.ProductName);
      formData.append('productDescription', productData.ProductDescription);
      formData.append('productRent', productData.ProductRent.toString());
      formData.append('category', productData.category);
      formData.append('quantity', productData.quantity.toString());
      formData.append('userRole', productData.userRole);
      formData.append('validUntil', productData.valid_until);
      formData.append('productOwnerEmail', productData.email);
      formData.append('city', productData.city);
      formData.append('productListedDate', productData.productListedDate);
      formData.append('size', productData.size);
      formData.append('color', productData.color);
      formData.append('ownerName', productData.ownerName);
      formData.append('ownerEmail', productData.ownerEmail);
      formData.append('ownerPhone', productData.ownerPhone);
      productData.display_img_urls.forEach((imgBase64: string, index: number) => {
        const byteCharacters = atob(imgBase64.split(',')[1]);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset++) {
          byteArrays.push(byteCharacters.charCodeAt(offset));
        }
        const blob = new Blob([new Uint8Array(byteArrays)], { type: 'image/jpeg' });
        formData.append(`image${index}`, blob, `image${index}.jpg`);
      });

      this.isUploading = true;
      this.myCartService.uploadProduct(formData).subscribe(
        (response: any) => {
          this.isUploading = false;
          this.userService.addUserHistory(formData);
          this.myCartService.openProductDetails(response,'add_product');
        },
        (error: any) => {
          this.isUploading = false;
          console.error('Error submitting product details', error);
          this.myCartService.showMessage('Failed to upload product. Please try again.');
        }
      );
    } else {
      this.productForm.markAllAsTouched();
      alert('Please fill all required fields and upload at least 3 images.');
    }
  }
}
