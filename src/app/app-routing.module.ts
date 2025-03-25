import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ContentComponentComponent } from './components/content-component/content-component.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { MyAccountComponent } from './components/my-account/my-account.component';
import { AuthGuard } from './guards/auth.guard'; // Import the AuthGuard

const routes: Routes = [
  { path: '', component: HomeComponent }, // Set HomeComponent as the default route
  { path: 'content', component: ContentComponentComponent },
  { path: 'add-product', component: AddProductComponent, canActivate: [AuthGuard] }, // Protect this route
  { path: 'my-account', component: MyAccountComponent, canActivate: [AuthGuard] }, // Protect this route
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect any unknown paths to HomeComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
