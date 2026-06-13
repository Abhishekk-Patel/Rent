import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Filter } from 'bad-words';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatStepper } from '@angular/material/stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MyCartServiceService } from 'src/app/service/my-cart-service.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css'],
})
export class AddProductComponent implements OnInit, OnDestroy {
  // UI flags
  isLocating = false;
  isUploading = false;

  // Drag & drop
  isDragOver = false;

  // Form
  productForm: FormGroup;

  // Images (base64 previews)
  selectedImages: string[] = [];

  // Dropdowns
  categories: string[] = [];
  sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
  colorOptions = [
    'Red', 'Blue', 'Green', 'Yellow', 'Black', 'White',
    'Pink', 'Purple', 'Gold', 'Silver', 'Other',
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

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public readonly myCartService: MyCartServiceService,
    private userService: UserService,
    private ngZone: NgZone
  ) {
    // basic auth check (same as your original)
    try {
      const userDetails = localStorage.getItem('userDetails');
      if (!userDetails) {
        this.router.navigate(['']);
      }
    } catch (e) {
      console.error('localStorage not available:', e);
      this.router.navigate(['']);
    }

    const today = new Date().toISOString().split('T')[0];

    // Single form group (used across steps)
    this.productForm = this.fb.group({
      // step 1
      ProductName: ['', [Validators.required, Validators.maxLength(30), this.nonNumericValidator]],
      userRole: ['', Validators.required],
      category: ['', Validators.required],
      size: ['', Validators.required],
      color: ['', Validators.required],
      ProductRent: ['', [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      valid_until: [today, Validators.required],
      city: ['', Validators.required],

      // step 2
      ProductDescription: [
        '',
        [
          Validators.required,
          Validators.maxLength(200),
          this.nonNumericValidator,
          this.inappropriateWordsValidator,
        ],
      ],

      // internal
      productListedDate: [today, Validators.required],

      // step 4
      ownerName: ['', [Validators.required, Validators.maxLength(40)]],
      ownerEmail: ['', [Validators.required, Validators.email]],
      ownerPhone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    });
  }

  // ---------------------------
  // Validators
  // ---------------------------
  nonNumericValidator(control: FormControl) {
    const value = control.value;
    if (value && !isNaN(value)) return { numeric: true };
    return null;
  }

  inappropriateWordsValidator(control: FormControl) {
    const filter = new Filter();
    const value = control.value;
    if (value && filter.isProfane(value)) return { inappropriate: true };
    return null;
  }

  // ---------------------------
  // Lifecycle
  // ---------------------------
  ngOnInit(): void {
    this.myCartService.setIsAddNewProduct(true);

    this.productForm.get('userRole')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((userRole) => {
        this.updateCategories(userRole);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateCategories(userRole: string): void {
    if (userRole === 'Bride') this.categories = this.brideCategories;
    else if (userRole === 'Groom') this.categories = this.groomCategories;
    else this.categories = [];

    // Reset category when role changes
    this.productForm.get('category')?.reset();
  }

  // ---------------------------
  // Stepper validation (IMPORTANT)
  // We are using [linear]="false" in HTML and validating manually.
  // ---------------------------
  private markControlsTouched(keys: string[]) {
    keys.forEach((k) => this.productForm.get(k)?.markAsTouched());
    this.productForm.updateValueAndValidity();
  }

  nextFromStep1(stepper: MatStepper) {
    const keys = [
      'ProductName',
      'userRole',
      'category',
      'size',
      'color',
      'ProductRent',
      'quantity',
      'valid_until',
      'city',
    ];

    this.markControlsTouched(keys);
    const ok = keys.every((k) => this.productForm.get(k)?.valid);
    if (ok) stepper.next();
  }

  nextFromStep2(stepper: MatStepper) {
    const keys = ['ProductDescription'];
    this.markControlsTouched(keys);

    const ok = keys.every((k) => this.productForm.get(k)?.valid);
    if (ok) stepper.next();
  }

  nextFromStep3(stepper: MatStepper) {
    if (this.selectedImages.length >= 3) {
      stepper.next();
    } else {
      alert('Please upload at least 3 images.');
    }
  }

  // ---------------------------
  // Location
  // ---------------------------
  detectLocation() {
    this.isLocating = true;

    if (!navigator.geolocation) {
      this.isLocating = false;
      console.error('Geolocation is not supported by this browser.');
      return;
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

          const fullAddress = [
            data.city,
            data.locality,
            data.principalSubdivision,
            data.postcode,
            data.countryName,
          ]
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

  // ---------------------------
  // Images: input + drag/drop
  // ---------------------------
  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (!files || files.length === 0) return;

    this.handleFiles(files);
  }

  private handleFiles(files: FileList) {
    this.selectedImages = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) this.selectedImages.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  // ---------------------------
  // Submit (same behaviour as your original)
  // ---------------------------
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

      // Convert base64 images -> Blob and append
      productData.display_img_urls.forEach((imgBase64: string, index: number) => {
        try {
          const base64 = imgBase64.split(',')[1];
          const byteCharacters = atob(base64);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }

          const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/jpeg' });
          formData.append(`image${index}`, blob, `image${index}.jpg`);
        } catch (e) {
          console.error('Failed to process image', index, e);
        }
      });

      this.isUploading = true;

      this.myCartService.uploadProduct(formData).subscribe(
        (res: any) => {
          // If your service returns HttpEvent stream, handle it too
          if (res && typeof res === 'object' && 'type' in res) {
            const event = res as HttpEvent<any>;
            if (event.type === HttpEventType.Response) {
              this.isUploading = false;
              const responseBody = event.body;
              this.userService.addUserHistory(formData);
              this.myCartService.openProductDetails(responseBody, 'add_product');
            }
            return;
          }

          // Normal response
          this.isUploading = false;
          this.userService.addUserHistory(formData);
          this.myCartService.openProductDetails(res, 'add_product');
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
