import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../core/api/cart.service';
import { OrderService } from '../../core/api/order.service';
import { Cart } from '../../core/models/cart.model';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, RouterModule, HeaderComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = false;
  displayedColumns = ['product', 'price', 'quantity', 'subtotal', 'actions'];

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  async loadCart() {
    this.loading = true;
    try {
      console.log('Cart component: Loading cart data...');
      this.cart = await this.cartService.getCart();
      console.log('Cart component: Cart data loaded successfully:', this.cart);
    } catch (error: any) {
      console.error('Cart component: Error loading cart:', error);
      this.toastr.error('Failed to load cart', 'Error');
    } finally {
      this.loading = false;
    }
  }

  async updateQuantity(productId: number, newQuantity: number) {
    if (newQuantity < 1) return;
    try {
      this.cart = await this.cartService.updateCartItem(productId, newQuantity);
      this.toastr.success('Cart updated', 'Success');
    } catch (error: any) {
      this.toastr.error('Failed to update cart', 'Error');
    }
  }

  async removeItem(productId: number) {
    try {
      this.cart = await this.cartService.removeFromCart(productId);
      this.toastr.success('Item removed from cart', 'Success');
    } catch (error: any) {
      this.toastr.error('Failed to remove item', 'Error');
    }
  }

  async checkout() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.toastr.error('Cart is empty', 'Error');
      return;
    }
    
    // Calculate the total to ensure it's a valid number
    let total = 0;
    if (this.cart.total !== undefined) {
      total = this.cart.total;
    } else {
      // Recalculate if cart.total isn't available
      this.cart.items.forEach(item => {
        if (item.product && item.product.price) {
          total += item.product.price * item.quantity;
        }
      });
    }
    
    console.log('Calculated total:', total);
    
    if (total <= 0) {
      this.toastr.error('Invalid cart total', 'Error');
      return;
    }
    
    try {
      this.loading = true;
      // Call the simplified checkout method with the calculated total
      console.log('Sending checkout request with total:', total);
      const response = await this.orderService.checkout(total);
      
      this.toastr.success('Order placed successfully', 'Success');
      
      // Navigate to the order confirmation page or orders history
      this.router.navigate(['/orders']);
    } catch (error: any) {
      console.error('Checkout error:', error);
      this.toastr.error(error.response?.data?.message || 'Failed to place order', 'Error');
    } finally {
      this.loading = false;
    }
  }
}
