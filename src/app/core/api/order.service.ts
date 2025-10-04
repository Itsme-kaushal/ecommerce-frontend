import { Injectable } from '@angular/core';
import axiosInstance from './axios-instance';
import { Order, CheckoutResponse } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  async checkout(total: number): Promise<CheckoutResponse> {
    try {
      console.log('Order service checkout with total:', total);
      
      // Ensure the total is a valid number
      if (isNaN(total) || total <= 0) {
        throw new Error('Invalid total amount');
      }
      
      // Explicitly format the request body with total as a number
      const requestBody = {
        total: Number(total)
      };
      
      console.log('Sending request with body:', requestBody);
      
      const response = await axiosInstance.post<any>('/orders/checkout', requestBody);
      
      console.log('Checkout response:', response.data);
      
      // Transform response to match CheckoutResponse interface
      return {
        message: response.data.message,
        order: {
          id: response.data.order_id,
          user_id: 0, // This is not returned by the API, but required by the interface
          total_amount: response.data.total_amount,
          status: response.data.status,
          createdAt: new Date(response.data.order_date),
          updatedAt: new Date(response.data.order_date)
        }
      };
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }

  async getOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('/orders');
    return response.data;
  }

  async getOrder(id: number): Promise<Order> {
    const response = await axiosInstance.get<Order>(`/orders/${id}`);
    return response.data;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await axiosInstance.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  }

  async getAllOrders(): Promise<Order[]> {
    const response = await axiosInstance.get<Order[]>('/admin/orders');
    return response.data;
  }
}
