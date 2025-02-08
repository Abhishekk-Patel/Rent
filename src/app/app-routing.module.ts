import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ContentComponentComponent } from './components/content-component/content-component.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { MyAccountComponent } from './components/my-account/my-account.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Set HomeComponent as the default route
  { path: 'content', component: ContentComponentComponent },
  { path: 'add-product', component: AddProductComponent },
  { path: 'my-account', component: MyAccountComponent }, 
  { path: '**', redirectTo: '', pathMatch: 'full' } // Redirect any unknown paths to HomeComponent
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
