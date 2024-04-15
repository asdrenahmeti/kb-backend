import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const tryToConvert = (value: any) => {
    try {
        return JSON.parse(value);
    } catch (error) {
        return value;
    }
}

export const getColumnNamesOfTable = async (tableName: string) => {
    try {
        const tableColumns: any = await Prisma.dmmf.datamodel.models
            .find((model: any) => model.dbName === tableName)
            .fields.map((field) => {
                return {
                    name: field.name,
                    type: field.type
                };
            });
        return tableColumns
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

export const getAllEnums = async () => {
    try {
        const schema: any = await prisma.$queryRaw`SELECT t.typname FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid GROUP BY t.typname;`;
        const enumNames = schema.map((row: any) => row.typname);
        return enumNames
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

export const removeNonExistingKeys = (object: any, columns: any[]) => {
    const keys = Object.keys(object);
    const validKeys = keys.filter(key => columns.some(column => column.name === key));
    const modifiedObject: any = {};
    validKeys.forEach(key => {
        modifiedObject[key] = object[key];
    });
    return modifiedObject;
}


@Injectable()
export class ParamsToQueryValidationPipe implements PipeTransform {
    constructor(private readonly table: string) { }
    async transform(query: any, metadata: ArgumentMetadata) {
        const columnDetails = await getColumnNamesOfTable(this.table)
        const removedKeys = removeNonExistingKeys(query, columnDetails)
        for (let key in removedKeys) {
            if (!isNaN(removedKeys[key])) {
                removedKeys[key] = tryToConvert(removedKeys[key]);
            }
        }
        return removedKeys;
    }
}