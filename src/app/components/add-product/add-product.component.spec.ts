import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductComponent } from './add-product.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';

fdescribe('AddProductComponent', () => {
  let component: AddProductComponent;
  let fixture: ComponentFixture<AddProductComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProductComponent],
      imports:[
        ReactiveFormsModule,
                MatSnackBarModule,      // <-- provides MatSnackBar
                NoopAnimationsModule,
                HttpClientModule,
                MatDialogModule,MatToolbarModule,
                MatDialogModule,
                MatIconModule,
                MatButtonModule,
                FormsModule,
                MatGridListModule,
                MatFormFieldModule,
                MatInputModule,
                MatExpansionModule,
                MatBadgeModule,
                MatSnackBarModule,
                MatPaginatorModule,
                MatMenuModule,
                MatStepperModule,
                MatDividerModule,
                ReactiveFormsModule,
                MatProgressSpinnerModule,
                MatTooltipModule,
                MatRadioModule,
                MatDatepickerModule,
                MatNativeDateModule,
                MatFormFieldModule,
                MatSelectModule,
                MatOptionModule,
                MatButtonToggleModule,
                HttpClientModule,
              MatTabsModule,
              MatCheckboxModule,
              
MatSnackBarModule,
MatFormFieldModule,
MatInputModule,
MatButtonModule,
MatIconModule,
MatCardModule

      ]
    });
    fixture = TestBed.createComponent(AddProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
it('should return { numeric: true } for a number', () => {
  const control = new FormControl(123); // number
  const result = component.nonNumericValidator(control);
  expect(result).toEqual({ numeric: true });
});

 
});
