import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { getOrderData, getProductData, LoadOrderData, LoadProductData } from './productData.action';
import { map, mergeMap, switchMap } from 'rxjs';
import { DataService } from 'src/app/service/data.service';
import { OrderService } from 'src/app/service/order.service';

@Injectable()
export class productDataEffects {
  constructor(private actions$: Actions, private dataService: DataService,private orderService: OrderService) {}

  loadProductData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LoadProductData),
      switchMap(() => {
        return this.dataService.getAllProductData().pipe(
          map((data) => {
            return getProductData({ data });
          })
        );
      })
    );
  });

  getOrderData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(LoadOrderData),
      switchMap((action)=>{
        return this.orderService.fetchOrders(action.email).pipe(
          map((OrderData) => {
            console.log(OrderData,"OrderData effect")
            return getOrderData({ OrderData });
          })
        )
      })
    )
  })

}
