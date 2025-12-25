import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ContentComponentComponent } from './components/content-component/content-component.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AuthGuard } from './guards/auth.guard';
import { MyCartComponent } from './components/my-cart/my-cart.component';
import { AboutUsComponent } from './components/footer/about-us/about-us.component';
import { ContactUsComponent } from './components/footer/contact-us/contact-us.component';
import { PrivacyComponent } from './components/footer/privacy/privacy.component';
import { TermsComponent } from './components/footer/terms/terms.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'content', component: ContentComponentComponent },
  { path: 'add-product', component: AddProductComponent }, //canActivate: [AuthGuard]
  { path: 'my-account', component: MyAccountComponent }, //canActivate: [AuthGuard]
  { path: 'MyCart', component: MyCartComponent }, //canActivate: [AuthGuard]
  { path: 'about', component: AboutUsComponent },
  { path: 'contact', component: ContactUsComponent },
  {path: 'privacy', component: PrivacyComponent },
  {path: 'terms', component: TermsComponent },

  
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect any unknown paths to HomeComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
