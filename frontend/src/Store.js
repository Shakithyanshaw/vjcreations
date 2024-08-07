import { createContext, useReducer } from 'react';

export const Store = createContext();
// Initialize state with values from local storage, if available
const initialState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : {},
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};
// Reducer function to handle state changes based on action types
function reducer(state, action) {
  switch (action.type) {
    case 'CART_ADD_ITEM':
      // Add item to cart
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Save cart items to local storage
      return { ...state, cart: { ...state.cart, cartItems } };
    case 'CART_REMOVE_ITEM': {
      // Remove item from cart
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems)); // Save updated cart items to local storage
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_CLEAR':
      // Clear all items from the cart
      localStorage.removeItem('cartItems'); // Clear cart items from local storage
      return { ...state, cart: { ...state.cart, cartItems: [] } };
    case 'USER_SIGNIN':
      // Sign in user
      return { ...state, userInfo: action.payload };
    case 'USER_SIGNOUT':
      // Sign out user and clear relevant local storage
      localStorage.removeItem('userInfo');
      localStorage.removeItem('cartItems'); // Clear cart items from local storage
      localStorage.removeItem('shippingAddress');
      localStorage.removeItem('paymentMethod');
      return {
        ...state,
        userInfo: null,
        cart: {
          shippingAddress: {},
          paymentMethod: '',
          cartItems: [],
        },
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children} </Store.Provider>;
}
