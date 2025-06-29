import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
  standalone: true
})
export class FileIconPipe implements PipeTransform {
  transform(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'txt': 'text_snippet',
      // Add more mappings as needed
    };
    return iconMap[ext || ''] || 'insert_drive_file'; // Default icon
  }
}
