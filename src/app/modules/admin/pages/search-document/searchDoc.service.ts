import { Injectable } from '@angular/core';
import { take } from 'lodash';
import { Observable, switchMap } from 'rxjs';
import { InventoryProduct } from '../upload-document/uploadDoc.types';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchDocService {

  constructor(private _httpClient: HttpClient) { }

   createProduct() 
   {
    this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {})
   }

   updateProduct()
   {
    this._httpClient.post<InventoryProduct>('api/apps/ecommerce/inventory/product', {})
   }
}
