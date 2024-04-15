import { Injectable, PipeTransform, ArgumentMetadata } from "@nestjs/common";
import { getColumnNamesOfTable, removeNonExistingKeys, tryToConvert } from "./params_to_query.pipes";

@Injectable()
export class ParamsToPaginationValidationPipe implements PipeTransform {
    async transform(query: any, metadata: ArgumentMetadata) {
        const paginationObject = removeNonExistingKeys(query, [{ name: "page" }, { name: "per_page" }])
        for (let key in paginationObject) {
            if (!isNaN(paginationObject[key])) {
                paginationObject[key] = tryToConvert(paginationObject[key]);
            }
        }
        const take: number | null = paginationObject.page ? paginationObject.per_page || 10 : null;
        const skip: number | null = paginationObject.page ? (paginationObject.page - 1) * take : null;
        const pagination = {
            ...((skip !== null) && { skip }),
            ...((take !== null) && { take }),
        }
        return Object.keys(pagination).length === 0 ? null : pagination
    }
}