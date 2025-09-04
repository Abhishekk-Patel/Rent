import { Action, createReducer, on } from '@ngrx/store';
import { getProductData, getOrderData } from './productData.action';

export const initialProductState: any[] = [];
export const initialOrderState: any[] = []; // Initial state for order data

export const productDataReducer = createReducer(
  initialProductState,
  on(getProductData, (state, { data }) => {
    return [...data]; // Update state with fetched product data
  })
);

export const orderDataReducer = createReducer(
  initialOrderState,
  on(getOrderData, (state, { OrderData }) => {
    return [...OrderData]; // Update state with fetched order data
  })
);

export function productReducer(state: any[] | undefined, action: Action) {
  return productDataReducer(state, action);
}

export function orderReducer(state: any[] | undefined, action: Action) {
  return orderDataReducer(state, action);
}
