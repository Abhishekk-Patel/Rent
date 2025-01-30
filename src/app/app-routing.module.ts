import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SortPanelComponent } from './components/sort-panel/sort-panel.component';
import { MyCartComponent } from './components/my-cart/my-cart.component';
import { ProductDetailsPopupComponent } from './components/product-details-popup/product-details-popup.component';
import { HomeComponent } from './components/home/home.component';
import { ContentComponentComponent } from './components/content-component/content-component.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Set HomeComponent as the default route
  { path: 'content', component: ContentComponentComponent }, 
  { path: 'header', component: HeaderComponent}, 
  { path: 'footer', component: FooterComponent}, 
  { path: 'sort-panel', component: SortPanelComponent },
  { path: 'myCart', component: MyCartComponent }, // Ensure this path matches the one used in openCart
  { path: 'productDetails', component: ProductDetailsPopupComponent }, // product details component will call on click know more btn
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect any unknown paths to HomeComponent

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
