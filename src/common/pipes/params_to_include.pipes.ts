import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { getColumnNamesOfTable, tryToConvert } from './params_to_query.pipes';

@Injectable()
export class ParamsToIncludeValidationPipe implements PipeTransform {
  constructor(private readonly table: string) {}

  async transform(query: any, metadata: ArgumentMetadata) {
    const columns = await getColumnNamesOfTable(this.table);

    const canInclude = columns.filter((col) => col.name);

    const includeQueryField =
      query?.include && query.include.split(',').map((el) => el.trim());

    const includeObject = {};
    includeQueryField?.forEach((el) => {
      if (canInclude.some((item) => item.name === el)) {
        includeObject[el] = true;
      }
    });

    return includeObject;
  }
}
