import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './components/header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FooterComponent } from './components/footer/footer.component';
import { ContentComponentComponent } from './components/content-component/content-component.component';
import { FormsModule } from '@angular/forms';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SortPanelComponent } from './components/sort-panel/sort-panel.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { AlertMsgsComponent } from './components/alert-msgs/alert-msgs.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';
import { MyCartComponent } from './components/my-cart/my-cart.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { ProductDetailsPopupComponent } from './components/product-details-popup/product-details-popup.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HomeComponent } from './components/home/home.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { AddProductComponent } from './components/add-product/add-product.component';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { HttpClientModule } from '@angular/common/http';
import { PartnerBrandSliderComponent } from './components/partner-brand-slider/partner-brand-slider.component'; // Import HttpClientModule
import { MatTabsModule } from '@angular/material/tabs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserRatingComponent } from './components/user-rating/user-rating.component';
import { AuthGuard } from './guards/auth.guard'; // Import the AuthGuard

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ContentComponentComponent,
    SortPanelComponent,
    AlertMsgsComponent,
    MyCartComponent,
    ProductDetailsPopupComponent,
    HomeComponent,
    AddProductComponent,
    MyAccountComponent,
    PartnerBrandSliderComponent,
    UserRatingComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
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
  ],
  providers: [AuthGuard], // Register the AuthGuard
  bootstrap: [AppComponent],
})
export class AppModule {}
