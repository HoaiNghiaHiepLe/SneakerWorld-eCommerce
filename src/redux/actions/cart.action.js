import { createAction } from "@reduxjs/toolkit";

import { CART_ACTION, REQUEST } from "../constants";

export const addToCartAction = createAction(REQUEST(CART_ACTION.ADD_TO_CART));
export const updateCartItemAction = createAction(
  REQUEST(CART_ACTION.UPDATE_CART_ITEM)
);
export const changeCartItemAction = createAction(
  REQUEST(CART_ACTION.CHANGE_CART_ITEM)
);
export const deleteCartItemAction = createAction(
  REQUEST(CART_ACTION.DELETE_CART_ITEM)
);
export const setCouponInfoAction = createAction(
  REQUEST(CART_ACTION.SET_COUPON_INFO)
);
export const setCheckoutInfoAction = createAction(
  REQUEST(CART_ACTION.SET_CHECKOUT_INFO)
);
export const setCheckoutPaymentAction = createAction(
  REQUEST(CART_ACTION.SET_CHECKOUT_PAYMENT)
);
export const resetCartListAction = createAction(
  REQUEST(CART_ACTION.RESET_CART_LIST)
);
