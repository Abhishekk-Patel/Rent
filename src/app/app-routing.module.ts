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
import { UnifiedChatComponent } from './components/unified-chat.component';
import { ProductDetailsPopupComponent } from './components/product-details-popup/product-details-popup.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { FeedbackDashboardComponent } from './components/feedback/feedback-dashboard/feedback-dashboard.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'content', component: ContentComponentComponent },
  { path: 'add-product', component: AddProductComponent }, //canActivate: [AuthGuard]
  { path: 'my-account', component: MyAccountComponent }, //canActivate: [AuthGuard]
  { path: 'MyCart', component: MyCartComponent }, //canActivate: [AuthGuard]
  { path: 'messenger', component: UnifiedChatComponent },

  { path: 'about', component: AboutUsComponent },
  { path: 'contact', component: ContactUsComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'product-details/:id', component: ProductDetailsPopupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'admin/feedback', component: FeedbackDashboardComponent },

  { path: '**', redirectTo: '', pathMatch: 'full' }, // Redirect any unknown paths to HomeComponent
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      //  scrollPositionRestoration: 'top', // always scroll to top on navigation
      //  anchorScrolling: 'enabled',       // scroll to #fragment anchors if present
      //  scrollOffset: [0, 0],             // (optional) adjust offset for fixed headers
      //  onSameUrlNavigation: 'reload',    // (optional) if you need same-route reloads
      //  // initialNavigation: 'enabledBlocking' // Angular 15+ SSR/strict mode (optional)
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
