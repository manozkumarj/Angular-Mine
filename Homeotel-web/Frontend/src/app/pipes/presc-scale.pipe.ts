import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prescScale'
})
export class PrescScalePipe implements PipeTransform {

  transform(items :any[], filter: { id, key }): any {
    if (!items || !items.length || !filter.id) {
      return items;
    }

    return items.filter(item => item[filter.key] == filter.id);

  }

}
