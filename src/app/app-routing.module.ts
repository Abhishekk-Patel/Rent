import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SortPanelComponent } from './components/sort-panel/sort-panel.component';
import { MyCartComponent } from './components/my-cart/my-cart.component';

const routes: Routes = [
  { path: 'sort-panel', component: SortPanelComponent },
  { path: 'myCart', component: MyCartComponent } // Ensure this path matches the one used in openCart
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
