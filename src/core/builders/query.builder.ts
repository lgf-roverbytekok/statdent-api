import { Prisma } from '@prisma/client';

// Helper type to define the nested structure of the "select"
type NestedSelect = { [key: string]: boolean | { select: NestedSelect } };

export abstract class QueryBuilder<T, WhereInput, OrderByInput, SelectInput> {
  protected abstract searchableFields: (keyof T)[];
  protected abstract defaultSort: OrderByInput;
  protected abstract defaultSelect: SelectInput;

  buildWhere(search?: string): WhereInput {
    if (!search) return {} as WhereInput;

    // An OR clause is constructed from the fields defined as "searchable"
    const whereClause = {
      OR: this.searchableFields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };

    return whereClause as unknown as WhereInput;
  }

  buildOrderBy(sort?: string): OrderByInput {
    if (!sort) return this.defaultSort;

    const [field, order] = sort.split(':');
    const validOrder: Prisma.SortOrder =
      order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    // The sort object is constructed dynamically
    const orderByClause = { [field]: validOrder };
    return orderByClause as unknown as OrderByInput;
  }

  buildSelect(fields?: string): SelectInput {
    if (!fields) return this.defaultSelect;

    // Initialize the selection object with the helper type
    const selectResult: NestedSelect = {};

    fields.split(',').forEach((field) => {
      const nestedFields = field.split('.');
      let currentLevel: NestedSelect = selectResult;

      nestedFields.forEach((f, index) => {
        if (!(f in currentLevel)) {
          // If it is the last field, "true" is assigned, otherwise an object with the "select" property is created
          currentLevel[f] =
            index === nestedFields.length - 1
              ? true
              : { select: {} as NestedSelect };
        }
        // If the assigned value is an object (with "select"), we update currentLevel
        if (typeof currentLevel[f] !== 'boolean') {
          currentLevel = (currentLevel[f] as { select: NestedSelect }).select;
        }
      });
    });

    return selectResult as SelectInput;
  }
}
