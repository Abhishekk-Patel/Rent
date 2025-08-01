import { createAction, props } from '@ngrx/store';

export const LoadProductData = createAction('LoadProductData');



export const getProductData = createAction(
  'getProductData',
  props<{ data: any }>()
);


export const LoadOrderData = createAction(
    '[Order] Load Order Data',
    props<{ email: string }>()
  );
  
  export const getOrderData = createAction(
    '[Order] Get Order Data',
    props<{ OrderData: any }>()
  );