import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'drugFilter',
  pure: false
})
export class DrugFilterPipe implements PipeTransform {

  transform(items: any[], filter: { id, key }): any {
    if (!items || !items.length || !filter.id) {
      return items;
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return items.filter(item => item[filter.key] == filter.id);
  }

}
