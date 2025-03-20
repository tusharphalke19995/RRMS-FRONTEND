import { withCache } from '@ngneat/cashew';

export class CashewUtil {
  static get context() {
    return withCache();
  }
}
