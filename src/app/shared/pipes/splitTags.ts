import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'splitTags'
})
export class SplitTagsPipe implements PipeTransform {
  transform(tags: string): string[] {
    if (!tags) {
      return [];
    }
    // Split by spaces or commas, depending on the format
    return tags.split(/[\s,]+/).map(tag => tag.trim()).filter(tag => tag.length > 0);
  }
}