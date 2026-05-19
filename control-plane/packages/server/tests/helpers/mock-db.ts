import type { Db } from "@dojo/db";

export function createMockDb(): Db {
  return {
    select: (fields?: any) => ({
      from: (_table: any) => {
        let resultData: any[] = [];

        // For count queries (stats endpoint)
        if (fields && "count" in fields) {
          resultData = [{ count: 0 }];
        }
        // For tags queries
        else if (fields && "tags" in fields) {
          resultData = [{ tags: [] }];
        }

        const result: any = Promise.resolve(resultData);
        result.where = () => result;
        result.orderBy = () => result;
        result.limit = () => result;

        return result;
      },
    }),
    insert: () => ({ values: () => ({ returning: () => Promise.resolve([]) }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }) }),
    delete: () => ({ where: () => ({ returning: () => Promise.resolve([]) }) }),
  } as any;
}
