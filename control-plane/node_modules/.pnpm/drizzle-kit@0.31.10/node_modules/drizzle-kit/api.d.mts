import { PGlite } from '@electric-sql/pglite';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { PgDatabase } from 'drizzle-orm/pg-core';
import { SingleStoreDriverDatabase } from 'drizzle-orm/singlestore';
import * as zod from 'zod';
import { TypeOf } from 'zod';
import { ConnectionOptions } from 'tls';

declare const prefixes: readonly ["index", "timestamp", "supabase", "unix", "none"];
type Prefix = (typeof prefixes)[number];
declare const casingTypes: readonly ["snake_case", "camelCase"];
type CasingType = (typeof casingTypes)[number];
declare const drivers: readonly ["d1-http", "expo", "aws-data-api", "pglite", "durable-sqlite"];
type Driver = (typeof drivers)[number];

declare const mysqlCredentials: zod.ZodUnion<[zod.ZodObject<{
    host: zod.ZodString;
    port: zod.ZodOptional<zod.ZodNumber>;
    user: zod.ZodOptional<zod.ZodString>;
    password: zod.ZodOptional<zod.ZodString>;
    database: zod.ZodString;
    ssl: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodObject<{
        pfx: zod.ZodOptional<zod.ZodString>;
        key: zod.ZodOptional<zod.ZodString>;
        passphrase: zod.ZodOptional<zod.ZodString>;
        cert: zod.ZodOptional<zod.ZodString>;
        ca: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
        crl: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
        ciphers: zod.ZodOptional<zod.ZodString>;
        rejectUnauthorized: zod.ZodOptional<zod.ZodBoolean>;
    }, "strip", zod.ZodTypeAny, {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    }, {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    }>]>>;
}, "strip", zod.ZodTypeAny, {
    host: string;
    database: string;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: string | {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    } | undefined;
}, {
    host: string;
    database: string;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: string | {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    } | undefined;
}>, zod.ZodObject<{
    url: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>]>;
type MysqlCredentials = TypeOf<typeof mysqlCredentials>;

declare const postgresCredentials: zod.ZodUnion<[zod.ZodEffects<zod.ZodObject<{
    driver: zod.ZodUndefined;
    host: zod.ZodString;
    port: zod.ZodOptional<zod.ZodNumber>;
    user: zod.ZodOptional<zod.ZodString>;
    password: zod.ZodOptional<zod.ZodString>;
    database: zod.ZodString;
    ssl: zod.ZodOptional<zod.ZodUnion<[zod.ZodLiteral<"require">, zod.ZodLiteral<"allow">, zod.ZodLiteral<"prefer">, zod.ZodLiteral<"verify-full">, zod.ZodBoolean, zod.ZodObject<{}, "passthrough", zod.ZodTypeAny, zod.objectOutputType<{}, zod.ZodTypeAny, "passthrough">, zod.objectInputType<{}, zod.ZodTypeAny, "passthrough">>]>>;
}, "strip", zod.ZodTypeAny, {
    host: string;
    database: string;
    driver?: undefined;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: boolean | "require" | "allow" | "prefer" | "verify-full" | zod.objectOutputType<{}, zod.ZodTypeAny, "passthrough"> | undefined;
}, {
    host: string;
    database: string;
    driver?: undefined;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: boolean | "require" | "allow" | "prefer" | "verify-full" | zod.objectInputType<{}, zod.ZodTypeAny, "passthrough"> | undefined;
}>, Omit<{
    host: string;
    database: string;
    driver?: undefined;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: boolean | "require" | "allow" | "prefer" | "verify-full" | zod.objectOutputType<{}, zod.ZodTypeAny, "passthrough"> | undefined;
}, "driver">, {
    host: string;
    database: string;
    driver?: undefined;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: boolean | "require" | "allow" | "prefer" | "verify-full" | zod.objectInputType<{}, zod.ZodTypeAny, "passthrough"> | undefined;
}>, zod.ZodEffects<zod.ZodObject<{
    driver: zod.ZodUndefined;
    url: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    url: string;
    driver?: undefined;
}, {
    url: string;
    driver?: undefined;
}>, {
    url: string;
}, {
    url: string;
    driver?: undefined;
}>, zod.ZodObject<{
    driver: zod.ZodLiteral<"aws-data-api">;
    database: zod.ZodString;
    secretArn: zod.ZodString;
    resourceArn: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    driver: "aws-data-api";
    database: string;
    secretArn: string;
    resourceArn: string;
}, {
    driver: "aws-data-api";
    database: string;
    secretArn: string;
    resourceArn: string;
}>, zod.ZodObject<{
    driver: zod.ZodLiteral<"pglite">;
    url: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    url: string;
    driver: "pglite";
}, {
    url: string;
    driver: "pglite";
}>]>;
type PostgresCredentials = TypeOf<typeof postgresCredentials>;

declare const singlestoreCredentials: zod.ZodUnion<[zod.ZodObject<{
    host: zod.ZodString;
    port: zod.ZodOptional<zod.ZodNumber>;
    user: zod.ZodOptional<zod.ZodString>;
    password: zod.ZodOptional<zod.ZodString>;
    database: zod.ZodString;
    ssl: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodObject<{
        pfx: zod.ZodOptional<zod.ZodString>;
        key: zod.ZodOptional<zod.ZodString>;
        passphrase: zod.ZodOptional<zod.ZodString>;
        cert: zod.ZodOptional<zod.ZodString>;
        ca: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
        crl: zod.ZodOptional<zod.ZodUnion<[zod.ZodString, zod.ZodArray<zod.ZodString, "many">]>>;
        ciphers: zod.ZodOptional<zod.ZodString>;
        rejectUnauthorized: zod.ZodOptional<zod.ZodBoolean>;
    }, "strip", zod.ZodTypeAny, {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    }, {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    }>]>>;
}, "strip", zod.ZodTypeAny, {
    host: string;
    database: string;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: string | {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    } | undefined;
}, {
    host: string;
    database: string;
    port?: number | undefined;
    user?: string | undefined;
    password?: string | undefined;
    ssl?: string | {
        pfx?: string | undefined;
        key?: string | undefined;
        passphrase?: string | undefined;
        cert?: string | undefined;
        ca?: string | string[] | undefined;
        crl?: string | string[] | undefined;
        ciphers?: string | undefined;
        rejectUnauthorized?: boolean | undefined;
    } | undefined;
}>, zod.ZodObject<{
    url: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    url: string;
}, {
    url: string;
}>]>;
type SingleStoreCredentials = TypeOf<typeof singlestoreCredentials>;

type SqliteCredentials = {
    driver: 'd1-http';
    accountId: string;
    databaseId: string;
    token: string;
} | {
    url: string;
};

declare const dialects: readonly ["postgresql", "mysql", "sqlite", "turso", "singlestore", "gel"];
type Dialect = (typeof dialects)[number];

type SslOptions = {
    pfx?: string;
    key?: string;
    passphrase?: string;
    cert?: string;
    ca?: string | string[];
    crl?: string | string[];
    ciphers?: string;
    rejectUnauthorized?: boolean;
};
type Verify<T, U extends T> = U;
/**
 * **You are currently using version 0.21.0+ of drizzle-kit. If you have just upgraded to this version, please make sure to read the changelog to understand what changes have been made and what
 * adjustments may be necessary for you. See https://orm.drizzle.team/kit-docs/upgrade-21#how-to-migrate-to-0210**
 *
 * **Config** usage:
 *
 * `dialect` - mandatory and is responsible for explicitly providing a databse dialect you are using for all the commands
 * *Possible values*: `postgresql`, `mysql`, `sqlite`, `singlestore
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#dialect
 *
 * ---
 * `schema` - param lets you define where your schema file/files live.
 * You can have as many separate schema files as you want and define paths to them using glob or array of globs syntax.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#schema
 *
 * ---
 * `out` - allows you to define the folder for your migrations and a folder, where drizzle will introspect the schema and relations
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#out
 *
 * ---
 * `driver` - optional param that is responsible for explicitly providing a driver to use when accessing a database
 * *Possible values*: `aws-data-api`, `d1-http`, `expo`, `turso`, `pglite`
 * If you don't use AWS Data API, D1, Turso or Expo - ypu don't need this driver. You can check a driver strategy choice here: https://orm.drizzle.team/kit-docs/upgrade-21
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#driver
 *
 * ---
 *
 * `dbCredentials` - an object to define your connection to the database. For more info please check the docs
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#dbcredentials
 *
 * ---
 *
 * `migrations` - param let’s use specify custom table and schema(PostgreSQL only) for migrations.
 * By default, all information about executed migrations will be stored in the database inside
 * the `__drizzle_migrations` table, and for PostgreSQL, inside the drizzle schema.
 * However, you can configure where to store those records.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#migrations
 *
 * ---
 *
 * `breakpoints` - param lets you enable/disable SQL statement breakpoints in generated migrations.
 * It’s optional and true by default, it’s necessary to properly apply migrations on databases,
 * that do not support multiple DDL alternation statements in one transaction(MySQL, SQLite, SingleStore) and
 * Drizzle ORM has to apply them sequentially one by one.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#breakpoints
 *
 * ---
 *
 * `tablesFilters` - param lets you filter tables with glob syntax for db push command.
 * It’s useful when you have only one database avaialable for several separate projects with separate sql schemas.
 *
 * How to define multi-project tables with Drizzle ORM — see https://orm.drizzle.team/docs/goodies#multi-project-schema
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#tablesfilters
 *
 * ---
 *
 * `schemaFilter` - parameter allows you to define which schema in PostgreSQL should be used for either introspect or push commands.
 * This parameter accepts a single schema as a string or an array of schemas as strings.
 * No glob pattern is supported here. By default, drizzle will use the public schema for both commands,
 * but you can add any schema you need.
 *
 * For example, having schemaFilter: ["my_schema"] will only look for tables in both the database and
 * drizzle schema that are a part of the my_schema schema.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#schemafilter
 *
 * ---
 *
 * `verbose` - command is used for drizzle-kit push commands and prints all statements that will be executed.
 *
 * > Note: This command will only print the statements that should be executed.
 * To approve them before applying, please refer to the `strict` command.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#verbose
 *
 * ---
 *
 * `strict` - command is used for drizzle-kit push commands and will always ask for your confirmation,
 * either to execute all statements needed to sync your schema with the database or not.
 *
 * See https://orm.drizzle.team/kit-docs/config-reference#strict
 */
type Config = {
    dialect: Dialect;
    out?: string;
    breakpoints?: boolean;
    tablesFilter?: string | string[];
    extensionsFilters?: 'postgis'[];
    schemaFilter?: string | string[];
    schema?: string | string[];
    verbose?: boolean;
    strict?: boolean;
    casing?: 'camelCase' | 'snake_case';
    migrations?: {
        table?: string;
        schema?: string;
        prefix?: Prefix;
    };
    introspect?: {
        casing: 'camel' | 'preserve';
    };
    entities?: {
        roles?: boolean | {
            provider?: 'supabase' | 'neon' | string & {};
            exclude?: string[];
            include?: string[];
        };
    };
} & ({
    dialect: Verify<Dialect, 'turso'>;
    dbCredentials: {
        url: string;
        authToken?: string;
    };
} | {
    dialect: Verify<Dialect, 'sqlite'>;
    dbCredentials: {
        url: string;
    };
} | {
    dialect: Verify<Dialect, 'postgresql'>;
    dbCredentials: ({
        host: string;
        port?: number;
        user?: string;
        password?: string;
        database: string;
        ssl?: boolean | 'require' | 'allow' | 'prefer' | 'verify-full' | ConnectionOptions;
    } & {}) | {
        url: string;
    };
} | {
    dialect: Verify<Dialect, 'postgresql'>;
    driver: Verify<Driver, 'aws-data-api'>;
    dbCredentials: {
        database: string;
        secretArn: string;
        resourceArn: string;
    };
} | {
    dialect: Verify<Dialect, 'postgresql'>;
    driver: Verify<Driver, 'pglite'>;
    dbCredentials: {
        url: string;
    };
} | {
    dialect: Verify<Dialect, 'mysql'>;
    dbCredentials: {
        host: string;
        port?: number;
        user?: string;
        password?: string;
        database: string;
        ssl?: string | SslOptions;
    } | {
        url: string;
    };
} | {
    dialect: Verify<Dialect, 'sqlite'>;
    driver: Verify<Driver, 'd1-http'>;
    dbCredentials: {
        accountId: string;
        databaseId: string;
        token: string;
    };
} | {
    dialect: Verify<Dialect, 'sqlite'>;
    driver: Verify<Driver, 'expo'>;
} | {
    dialect: Verify<Dialect, 'sqlite'>;
    driver: Verify<Driver, 'durable-sqlite'>;
} | {} | {
    dialect: Verify<Dialect, 'singlestore'>;
    dbCredentials: {
        host: string;
        port?: number;
        user?: string;
        password?: string;
        database: string;
        ssl?: string | SslOptions;
    } | {
        url: string;
    };
} | {
    dialect: Verify<Dialect, 'gel'>;
    dbCredentials?: {
        tlsSecurity?: 'insecure' | 'no_host_verification' | 'strict' | 'default';
    } & ({
        url: string;
    } | ({
        host: string;
        port?: number;
        user?: string;
        password?: string;
        database: string;
    }));
});

declare const schema$2: zod.ZodObject<{
    version: zod.ZodLiteral<"5">;
    dialect: zod.ZodLiteral<"mysql">;
    tables: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            autoincrement: zod.ZodOptional<zod.ZodBoolean>;
            default: zod.ZodOptional<zod.ZodAny>;
            onUpdate: zod.ZodOptional<zod.ZodAny>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodEnum<["stored", "virtual"]>;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored" | "virtual";
                as: string;
            }, {
                type: "stored" | "virtual";
                as: string;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>>;
        indexes: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
            isUnique: zod.ZodBoolean;
            using: zod.ZodOptional<zod.ZodEnum<["btree", "hash"]>>;
            algorithm: zod.ZodOptional<zod.ZodEnum<["default", "inplace", "copy"]>>;
            lock: zod.ZodOptional<zod.ZodEnum<["default", "none", "shared", "exclusive"]>>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>>;
        foreignKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            tableFrom: zod.ZodString;
            columnsFrom: zod.ZodArray<zod.ZodString, "many">;
            tableTo: zod.ZodString;
            columnsTo: zod.ZodArray<zod.ZodString, "many">;
            onUpdate: zod.ZodOptional<zod.ZodString>;
            onDelete: zod.ZodOptional<zod.ZodString>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>>;
        compositePrimaryKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>;
        uniqueConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>>;
        checkConstraint: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            value: zod.ZodString;
        }, "strict", zod.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>>>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
        checkConstraint: Record<string, {
            value: string;
            name: string;
        }>;
    }, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
        checkConstraint?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
    }>>;
    views: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            autoincrement: zod.ZodOptional<zod.ZodBoolean>;
            default: zod.ZodOptional<zod.ZodAny>;
            onUpdate: zod.ZodOptional<zod.ZodAny>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodEnum<["stored", "virtual"]>;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored" | "virtual";
                as: string;
            }, {
                type: "stored" | "virtual";
                as: string;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>>;
        definition: zod.ZodOptional<zod.ZodString>;
        isExisting: zod.ZodBoolean;
    } & {
        algorithm: zod.ZodEnum<["undefined", "merge", "temptable"]>;
        sqlSecurity: zod.ZodEnum<["definer", "invoker"]>;
        withCheckOption: zod.ZodOptional<zod.ZodEnum<["local", "cascaded"]>>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        algorithm: "undefined" | "merge" | "temptable";
        sqlSecurity: "definer" | "invoker";
        definition?: string | undefined;
        withCheckOption?: "local" | "cascaded" | undefined;
    }, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        algorithm: "undefined" | "merge" | "temptable";
        sqlSecurity: "definer" | "invoker";
        definition?: string | undefined;
        withCheckOption?: "local" | "cascaded" | undefined;
    }>>>;
    _meta: zod.ZodObject<{
        tables: zod.ZodRecord<zod.ZodString, zod.ZodString>;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodString>;
    }, "strip", zod.ZodTypeAny, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }>;
    internal: zod.ZodOptional<zod.ZodObject<{
        tables: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isDefaultAnExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isDefaultAnExpression?: boolean | undefined;
            }, {
                isDefaultAnExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }>>>>;
        indexes: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isExpression?: boolean | undefined;
            }, {
                isExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }>>>>;
    }, "strip", zod.ZodTypeAny, {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }, {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }>>;
} & {
    id: zod.ZodString;
    prevId: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    version: "5";
    dialect: "mysql";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
        checkConstraint: Record<string, {
            value: string;
            name: string;
        }>;
    }>;
    views: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        algorithm: "undefined" | "merge" | "temptable";
        sqlSecurity: "definer" | "invoker";
        definition?: string | undefined;
        withCheckOption?: "local" | "cascaded" | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}, {
    version: "5";
    dialect: "mysql";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
        checkConstraint?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    views?: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        algorithm: "undefined" | "merge" | "temptable";
        sqlSecurity: "definer" | "invoker";
        definition?: string | undefined;
        withCheckOption?: "local" | "cascaded" | undefined;
    }> | undefined;
    internal?: {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}>;
type MySqlSchema = TypeOf<typeof schema$2>;

declare const pgSchema: zod.ZodObject<{
    version: zod.ZodLiteral<"7">;
    dialect: zod.ZodLiteral<"postgresql">;
    tables: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        schema: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            typeSchema: zod.ZodOptional<zod.ZodString>;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            default: zod.ZodOptional<zod.ZodAny>;
            isUnique: zod.ZodOptional<zod.ZodAny>;
            uniqueName: zod.ZodOptional<zod.ZodString>;
            nullsNotDistinct: zod.ZodOptional<zod.ZodBoolean>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodLiteral<"stored">;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored";
                as: string;
            }, {
                type: "stored";
                as: string;
            }>>;
            identity: zod.ZodOptional<zod.ZodObject<{
                name: zod.ZodString;
                increment: zod.ZodOptional<zod.ZodString>;
                minValue: zod.ZodOptional<zod.ZodString>;
                maxValue: zod.ZodOptional<zod.ZodString>;
                startWith: zod.ZodOptional<zod.ZodString>;
                cache: zod.ZodOptional<zod.ZodString>;
                cycle: zod.ZodOptional<zod.ZodBoolean>;
                schema: zod.ZodString;
            } & {
                type: zod.ZodEnum<["always", "byDefault"]>;
            }, "strip", zod.ZodTypeAny, {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            }, {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>>;
        indexes: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodObject<{
                expression: zod.ZodString;
                isExpression: zod.ZodBoolean;
                asc: zod.ZodBoolean;
                nulls: zod.ZodOptional<zod.ZodString>;
                opclass: zod.ZodOptional<zod.ZodString>;
            }, "strip", zod.ZodTypeAny, {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }, {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }>, "many">;
            isUnique: zod.ZodBoolean;
            with: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodAny>>;
            method: zod.ZodDefault<zod.ZodString>;
            where: zod.ZodOptional<zod.ZodString>;
            concurrently: zod.ZodDefault<zod.ZodBoolean>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            method: string;
            concurrently: boolean;
            with?: Record<string, any> | undefined;
            where?: string | undefined;
        }, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            with?: Record<string, any> | undefined;
            method?: string | undefined;
            where?: string | undefined;
            concurrently?: boolean | undefined;
        }>>;
        foreignKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            tableFrom: zod.ZodString;
            columnsFrom: zod.ZodArray<zod.ZodString, "many">;
            tableTo: zod.ZodString;
            schemaTo: zod.ZodOptional<zod.ZodString>;
            columnsTo: zod.ZodArray<zod.ZodString, "many">;
            onUpdate: zod.ZodOptional<zod.ZodString>;
            onDelete: zod.ZodOptional<zod.ZodString>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>>;
        compositePrimaryKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>;
        uniqueConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
            nullsNotDistinct: zod.ZodBoolean;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }>>>;
        policies: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            as: zod.ZodOptional<zod.ZodEnum<["PERMISSIVE", "RESTRICTIVE"]>>;
            for: zod.ZodOptional<zod.ZodEnum<["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"]>>;
            to: zod.ZodOptional<zod.ZodArray<zod.ZodString, "many">>;
            using: zod.ZodOptional<zod.ZodString>;
            withCheck: zod.ZodOptional<zod.ZodString>;
            on: zod.ZodOptional<zod.ZodString>;
            schema: zod.ZodOptional<zod.ZodString>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }>>>;
        checkConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            value: zod.ZodString;
        }, "strict", zod.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>>>;
        isRLSEnabled: zod.ZodDefault<zod.ZodBoolean>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            method: string;
            concurrently: boolean;
            with?: Record<string, any> | undefined;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }>;
        policies: Record<string, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }>;
        checkConstraints: Record<string, {
            value: string;
            name: string;
        }>;
        isRLSEnabled: boolean;
    }, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            with?: Record<string, any> | undefined;
            method?: string | undefined;
            where?: string | undefined;
            concurrently?: boolean | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }> | undefined;
        policies?: Record<string, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }> | undefined;
        checkConstraints?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
        isRLSEnabled?: boolean | undefined;
    }>>;
    enums: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        schema: zod.ZodString;
        values: zod.ZodArray<zod.ZodString, "many">;
    }, "strict", zod.ZodTypeAny, {
        values: string[];
        name: string;
        schema: string;
    }, {
        values: string[];
        name: string;
        schema: string;
    }>>;
    schemas: zod.ZodRecord<zod.ZodString, zod.ZodString>;
    views: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        schema: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            typeSchema: zod.ZodOptional<zod.ZodString>;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            default: zod.ZodOptional<zod.ZodAny>;
            isUnique: zod.ZodOptional<zod.ZodAny>;
            uniqueName: zod.ZodOptional<zod.ZodString>;
            nullsNotDistinct: zod.ZodOptional<zod.ZodBoolean>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodLiteral<"stored">;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored";
                as: string;
            }, {
                type: "stored";
                as: string;
            }>>;
            identity: zod.ZodOptional<zod.ZodObject<{
                name: zod.ZodString;
                increment: zod.ZodOptional<zod.ZodString>;
                minValue: zod.ZodOptional<zod.ZodString>;
                maxValue: zod.ZodOptional<zod.ZodString>;
                startWith: zod.ZodOptional<zod.ZodString>;
                cache: zod.ZodOptional<zod.ZodString>;
                cycle: zod.ZodOptional<zod.ZodBoolean>;
                schema: zod.ZodString;
            } & {
                type: zod.ZodEnum<["always", "byDefault"]>;
            }, "strip", zod.ZodTypeAny, {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            }, {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>>;
        definition: zod.ZodOptional<zod.ZodString>;
        materialized: zod.ZodBoolean;
        with: zod.ZodOptional<zod.ZodObject<{
            checkOption: zod.ZodOptional<zod.ZodEnum<["local", "cascaded"]>>;
            securityBarrier: zod.ZodOptional<zod.ZodBoolean>;
            securityInvoker: zod.ZodOptional<zod.ZodBoolean>;
        } & {
            fillfactor: zod.ZodOptional<zod.ZodNumber>;
            toastTupleTarget: zod.ZodOptional<zod.ZodNumber>;
            parallelWorkers: zod.ZodOptional<zod.ZodNumber>;
            autovacuumEnabled: zod.ZodOptional<zod.ZodBoolean>;
            vacuumIndexCleanup: zod.ZodOptional<zod.ZodEnum<["auto", "off", "on"]>>;
            vacuumTruncate: zod.ZodOptional<zod.ZodBoolean>;
            autovacuumVacuumThreshold: zod.ZodOptional<zod.ZodNumber>;
            autovacuumVacuumScaleFactor: zod.ZodOptional<zod.ZodNumber>;
            autovacuumVacuumCostDelay: zod.ZodOptional<zod.ZodNumber>;
            autovacuumVacuumCostLimit: zod.ZodOptional<zod.ZodNumber>;
            autovacuumFreezeMinAge: zod.ZodOptional<zod.ZodNumber>;
            autovacuumFreezeMaxAge: zod.ZodOptional<zod.ZodNumber>;
            autovacuumFreezeTableAge: zod.ZodOptional<zod.ZodNumber>;
            autovacuumMultixactFreezeMinAge: zod.ZodOptional<zod.ZodNumber>;
            autovacuumMultixactFreezeMaxAge: zod.ZodOptional<zod.ZodNumber>;
            autovacuumMultixactFreezeTableAge: zod.ZodOptional<zod.ZodNumber>;
            logAutovacuumMinDuration: zod.ZodOptional<zod.ZodNumber>;
            userCatalogTable: zod.ZodOptional<zod.ZodBoolean>;
        }, "strict", zod.ZodTypeAny, {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        }, {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        }>>;
        isExisting: zod.ZodBoolean;
        withNoData: zod.ZodOptional<zod.ZodBoolean>;
        using: zod.ZodOptional<zod.ZodString>;
        tablespace: zod.ZodOptional<zod.ZodString>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        materialized: boolean;
        isExisting: boolean;
        with?: {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        } | undefined;
        using?: string | undefined;
        definition?: string | undefined;
        withNoData?: boolean | undefined;
        tablespace?: string | undefined;
    }, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        materialized: boolean;
        isExisting: boolean;
        with?: {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        } | undefined;
        using?: string | undefined;
        definition?: string | undefined;
        withNoData?: boolean | undefined;
        tablespace?: string | undefined;
    }>>>;
    sequences: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        increment: zod.ZodOptional<zod.ZodString>;
        minValue: zod.ZodOptional<zod.ZodString>;
        maxValue: zod.ZodOptional<zod.ZodString>;
        startWith: zod.ZodOptional<zod.ZodString>;
        cache: zod.ZodOptional<zod.ZodString>;
        cycle: zod.ZodOptional<zod.ZodBoolean>;
        schema: zod.ZodString;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        schema: string;
        increment?: string | undefined;
        minValue?: string | undefined;
        maxValue?: string | undefined;
        startWith?: string | undefined;
        cache?: string | undefined;
        cycle?: boolean | undefined;
    }, {
        name: string;
        schema: string;
        increment?: string | undefined;
        minValue?: string | undefined;
        maxValue?: string | undefined;
        startWith?: string | undefined;
        cache?: string | undefined;
        cycle?: boolean | undefined;
    }>>>;
    roles: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        createDb: zod.ZodOptional<zod.ZodBoolean>;
        createRole: zod.ZodOptional<zod.ZodBoolean>;
        inherit: zod.ZodOptional<zod.ZodBoolean>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        createDb?: boolean | undefined;
        createRole?: boolean | undefined;
        inherit?: boolean | undefined;
    }, {
        name: string;
        createDb?: boolean | undefined;
        createRole?: boolean | undefined;
        inherit?: boolean | undefined;
    }>>>;
    policies: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        as: zod.ZodOptional<zod.ZodEnum<["PERMISSIVE", "RESTRICTIVE"]>>;
        for: zod.ZodOptional<zod.ZodEnum<["ALL", "SELECT", "INSERT", "UPDATE", "DELETE"]>>;
        to: zod.ZodOptional<zod.ZodArray<zod.ZodString, "many">>;
        using: zod.ZodOptional<zod.ZodString>;
        withCheck: zod.ZodOptional<zod.ZodString>;
        on: zod.ZodOptional<zod.ZodString>;
        schema: zod.ZodOptional<zod.ZodString>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        schema?: string | undefined;
        as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
        for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
        to?: string[] | undefined;
        using?: string | undefined;
        withCheck?: string | undefined;
        on?: string | undefined;
    }, {
        name: string;
        schema?: string | undefined;
        as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
        for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
        to?: string[] | undefined;
        using?: string | undefined;
        withCheck?: string | undefined;
        on?: string | undefined;
    }>>>;
    _meta: zod.ZodObject<{
        schemas: zod.ZodRecord<zod.ZodString, zod.ZodString>;
        tables: zod.ZodRecord<zod.ZodString, zod.ZodString>;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodString>;
    }, "strip", zod.ZodTypeAny, {
        tables: Record<string, string>;
        columns: Record<string, string>;
        schemas: Record<string, string>;
    }, {
        tables: Record<string, string>;
        columns: Record<string, string>;
        schemas: Record<string, string>;
    }>;
    internal: zod.ZodOptional<zod.ZodObject<{
        tables: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isArray: zod.ZodOptional<zod.ZodBoolean>;
                dimensions: zod.ZodOptional<zod.ZodNumber>;
                rawType: zod.ZodOptional<zod.ZodString>;
                isDefaultAnExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            }, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }>>>;
    }, "strip", zod.ZodTypeAny, {
        tables: Record<string, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined>;
    }, {
        tables: Record<string, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined>;
    }>>;
} & {
    id: zod.ZodString;
    prevId: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    version: "7";
    dialect: "postgresql";
    tables: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            method: string;
            concurrently: boolean;
            with?: Record<string, any> | undefined;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }>;
        policies: Record<string, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }>;
        checkConstraints: Record<string, {
            value: string;
            name: string;
        }>;
        isRLSEnabled: boolean;
    }>;
    policies: Record<string, {
        name: string;
        schema?: string | undefined;
        as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
        for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
        to?: string[] | undefined;
        using?: string | undefined;
        withCheck?: string | undefined;
        on?: string | undefined;
    }>;
    enums: Record<string, {
        values: string[];
        name: string;
        schema: string;
    }>;
    schemas: Record<string, string>;
    views: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        materialized: boolean;
        isExisting: boolean;
        with?: {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        } | undefined;
        using?: string | undefined;
        definition?: string | undefined;
        withNoData?: boolean | undefined;
        tablespace?: string | undefined;
    }>;
    sequences: Record<string, {
        name: string;
        schema: string;
        increment?: string | undefined;
        minValue?: string | undefined;
        maxValue?: string | undefined;
        startWith?: string | undefined;
        cache?: string | undefined;
        cycle?: boolean | undefined;
    }>;
    roles: Record<string, {
        name: string;
        createDb?: boolean | undefined;
        createRole?: boolean | undefined;
        inherit?: boolean | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
        schemas: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        tables: Record<string, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined>;
    } | undefined;
}, {
    version: "7";
    dialect: "postgresql";
    tables: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            with?: Record<string, any> | undefined;
            method?: string | undefined;
            where?: string | undefined;
            concurrently?: boolean | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }> | undefined;
        policies?: Record<string, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }> | undefined;
        checkConstraints?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
        isRLSEnabled?: boolean | undefined;
    }>;
    enums: Record<string, {
        values: string[];
        name: string;
        schema: string;
    }>;
    schemas: Record<string, string>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
        schemas: Record<string, string>;
    };
    id: string;
    prevId: string;
    policies?: Record<string, {
        name: string;
        schema?: string | undefined;
        as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
        for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
        to?: string[] | undefined;
        using?: string | undefined;
        withCheck?: string | undefined;
        on?: string | undefined;
    }> | undefined;
    views?: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        materialized: boolean;
        isExisting: boolean;
        with?: {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        } | undefined;
        using?: string | undefined;
        definition?: string | undefined;
        withNoData?: boolean | undefined;
        tablespace?: string | undefined;
    }> | undefined;
    sequences?: Record<string, {
        name: string;
        schema: string;
        increment?: string | undefined;
        minValue?: string | undefined;
        maxValue?: string | undefined;
        startWith?: string | undefined;
        cache?: string | undefined;
        cycle?: boolean | undefined;
    }> | undefined;
    roles?: Record<string, {
        name: string;
        createDb?: boolean | undefined;
        createRole?: boolean | undefined;
        inherit?: boolean | undefined;
    }> | undefined;
    internal?: {
        tables: Record<string, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined>;
    } | undefined;
}>;
type PgSchema = TypeOf<typeof pgSchema>;

declare const schema$1: zod.ZodObject<{
    version: zod.ZodLiteral<"1">;
    dialect: zod.ZodLiteral<"singlestore">;
    tables: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            autoincrement: zod.ZodOptional<zod.ZodBoolean>;
            default: zod.ZodOptional<zod.ZodAny>;
            onUpdate: zod.ZodOptional<zod.ZodAny>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodEnum<["stored", "virtual"]>;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored" | "virtual";
                as: string;
            }, {
                type: "stored" | "virtual";
                as: string;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>>;
        indexes: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
            isUnique: zod.ZodBoolean;
            using: zod.ZodOptional<zod.ZodEnum<["btree", "hash"]>>;
            algorithm: zod.ZodOptional<zod.ZodEnum<["default", "inplace", "copy"]>>;
            lock: zod.ZodOptional<zod.ZodEnum<["default", "none", "shared", "exclusive"]>>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>>;
        compositePrimaryKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>;
        uniqueConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
    }, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
    }>>;
    _meta: zod.ZodObject<{
        tables: zod.ZodRecord<zod.ZodString, zod.ZodString>;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodString>;
    }, "strip", zod.ZodTypeAny, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }>;
    internal: zod.ZodOptional<zod.ZodObject<{
        tables: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isDefaultAnExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isDefaultAnExpression?: boolean | undefined;
            }, {
                isDefaultAnExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        }>>>>;
        indexes: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isExpression?: boolean | undefined;
            }, {
                isExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }>>>>;
    }, "strip", zod.ZodTypeAny, {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }, {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }>>;
} & {
    id: zod.ZodString;
    prevId: zod.ZodString;
}, "strip", zod.ZodTypeAny, {
    version: "1";
    dialect: "singlestore";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}, {
    version: "1";
    dialect: "singlestore";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            onUpdate?: any;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            using?: "btree" | "hash" | undefined;
            algorithm?: "default" | "inplace" | "copy" | undefined;
            lock?: "default" | "none" | "shared" | "exclusive" | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        tables?: Record<string, {
            columns: Record<string, {
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}>;
type SingleStoreSchema = TypeOf<typeof schema$1>;

declare const schema: zod.ZodObject<{
    version: zod.ZodLiteral<"6">;
    dialect: zod.ZodEnum<["sqlite"]>;
    tables: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            autoincrement: zod.ZodOptional<zod.ZodBoolean>;
            default: zod.ZodOptional<zod.ZodAny>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodEnum<["stored", "virtual"]>;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored" | "virtual";
                as: string;
            }, {
                type: "stored" | "virtual";
                as: string;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>>;
        indexes: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
            where: zod.ZodOptional<zod.ZodString>;
            isUnique: zod.ZodBoolean;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }>>;
        foreignKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            tableFrom: zod.ZodString;
            columnsFrom: zod.ZodArray<zod.ZodString, "many">;
            tableTo: zod.ZodString;
            columnsTo: zod.ZodArray<zod.ZodString, "many">;
            onUpdate: zod.ZodOptional<zod.ZodString>;
            onDelete: zod.ZodOptional<zod.ZodString>;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>>;
        compositePrimaryKeys: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            columns: zod.ZodArray<zod.ZodString, "many">;
            name: zod.ZodOptional<zod.ZodString>;
        }, "strict", zod.ZodTypeAny, {
            columns: string[];
            name?: string | undefined;
        }, {
            columns: string[];
            name?: string | undefined;
        }>>;
        uniqueConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            columns: zod.ZodArray<zod.ZodString, "many">;
        }, "strict", zod.ZodTypeAny, {
            name: string;
            columns: string[];
        }, {
            name: string;
            columns: string[];
        }>>>;
        checkConstraints: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            value: zod.ZodString;
        }, "strict", zod.ZodTypeAny, {
            value: string;
            name: string;
        }, {
            value: string;
            name: string;
        }>>>;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            columns: string[];
            name?: string | undefined;
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
        checkConstraints: Record<string, {
            value: string;
            name: string;
        }>;
    }, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            columns: string[];
            name?: string | undefined;
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
        checkConstraints?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
    }>>;
    views: zod.ZodDefault<zod.ZodRecord<zod.ZodString, zod.ZodObject<{
        name: zod.ZodString;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodObject<{
            name: zod.ZodString;
            type: zod.ZodString;
            primaryKey: zod.ZodBoolean;
            notNull: zod.ZodBoolean;
            autoincrement: zod.ZodOptional<zod.ZodBoolean>;
            default: zod.ZodOptional<zod.ZodAny>;
            generated: zod.ZodOptional<zod.ZodObject<{
                type: zod.ZodEnum<["stored", "virtual"]>;
                as: zod.ZodString;
            }, "strip", zod.ZodTypeAny, {
                type: "stored" | "virtual";
                as: string;
            }, {
                type: "stored" | "virtual";
                as: string;
            }>>;
        }, "strict", zod.ZodTypeAny, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>>;
        definition: zod.ZodOptional<zod.ZodString>;
        isExisting: zod.ZodBoolean;
    }, "strict", zod.ZodTypeAny, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        definition?: string | undefined;
    }, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        definition?: string | undefined;
    }>>>;
    enums: zod.ZodObject<{}, "strip", zod.ZodTypeAny, {}, {}>;
    _meta: zod.ZodObject<{
        tables: zod.ZodRecord<zod.ZodString, zod.ZodString>;
        columns: zod.ZodRecord<zod.ZodString, zod.ZodString>;
    }, "strip", zod.ZodTypeAny, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }, {
        tables: Record<string, string>;
        columns: Record<string, string>;
    }>;
    internal: zod.ZodOptional<zod.ZodObject<{
        indexes: zod.ZodOptional<zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
            columns: zod.ZodRecord<zod.ZodString, zod.ZodOptional<zod.ZodObject<{
                isExpression: zod.ZodOptional<zod.ZodBoolean>;
            }, "strip", zod.ZodTypeAny, {
                isExpression?: boolean | undefined;
            }, {
                isExpression?: boolean | undefined;
            }>>>;
        }, "strip", zod.ZodTypeAny, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        }>>>>;
    }, "strip", zod.ZodTypeAny, {
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }, {
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    }>>;
} & {
    id: zod.ZodString;
    prevId: zod.ZodString;
}, "strict", zod.ZodTypeAny, {
    version: "6";
    dialect: "sqlite";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            columns: string[];
            name?: string | undefined;
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
        }>;
        checkConstraints: Record<string, {
            value: string;
            name: string;
        }>;
    }>;
    enums: {};
    views: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        definition?: string | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}, {
    version: "6";
    dialect: "sqlite";
    tables: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: string[];
            isUnique: boolean;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            columns: string[];
            name?: string | undefined;
        }>;
        uniqueConstraints?: Record<string, {
            name: string;
            columns: string[];
        }> | undefined;
        checkConstraints?: Record<string, {
            value: string;
            name: string;
        }> | undefined;
    }>;
    enums: {};
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
    };
    id: string;
    prevId: string;
    views?: Record<string, {
        name: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            default?: any;
            generated?: {
                type: "stored" | "virtual";
                as: string;
            } | undefined;
            autoincrement?: boolean | undefined;
        }>;
        isExisting: boolean;
        definition?: string | undefined;
    }> | undefined;
    internal?: {
        indexes?: Record<string, {
            columns: Record<string, {
                isExpression?: boolean | undefined;
            } | undefined>;
        } | undefined> | undefined;
    } | undefined;
}>;
type SQLiteSchema = TypeOf<typeof schema>;

type DrizzleSnapshotJSON = PgSchema;
type DrizzleSQLiteSnapshotJSON = SQLiteSchema;
type DrizzleMySQLSnapshotJSON = MySqlSchema;
type DrizzleSingleStoreSnapshotJSON = SingleStoreSchema;
declare const generateDrizzleJson: (imports: Record<string, unknown>, prevId?: string, schemaFilters?: string[], casing?: CasingType) => PgSchema;
declare const generateMigration: (prev: DrizzleSnapshotJSON, cur: DrizzleSnapshotJSON) => Promise<string[]>;
declare const pushSchema: (imports: Record<string, unknown>, drizzleInstance: PgDatabase<any>, schemaFilters?: string[], tablesFilter?: string[], extensionsFilters?: Config["extensionsFilters"]) => Promise<{
    hasDataLoss: boolean;
    warnings: string[];
    statementsToExecute: string[];
    apply: () => Promise<void>;
}>;
declare const startStudioPostgresServer: (imports: Record<string, unknown>, credentials: PostgresCredentials | {
    driver: "pglite";
    client: PGlite;
}, options?: {
    host?: string;
    port?: number;
    casing?: CasingType;
}) => Promise<void>;
declare const generateSQLiteDrizzleJson: (imports: Record<string, unknown>, prevId?: string, casing?: CasingType) => Promise<SQLiteSchema>;
declare const generateSQLiteMigration: (prev: DrizzleSQLiteSnapshotJSON, cur: DrizzleSQLiteSnapshotJSON) => Promise<string[]>;
declare const pushSQLiteSchema: (imports: Record<string, unknown>, drizzleInstance: LibSQLDatabase<any>) => Promise<{
    hasDataLoss: boolean;
    warnings: string[];
    statementsToExecute: string[];
    apply: () => Promise<void>;
}>;
declare const startStudioSQLiteServer: (imports: Record<string, unknown>, credentials: SqliteCredentials | {
    driver: "d1";
    binding: D1Database;
}, options?: {
    host?: string;
    port?: number;
    casing?: CasingType;
}) => Promise<void>;
declare const generateMySQLDrizzleJson: (imports: Record<string, unknown>, prevId?: string, casing?: CasingType) => Promise<MySqlSchema>;
declare const generateMySQLMigration: (prev: DrizzleMySQLSnapshotJSON, cur: DrizzleMySQLSnapshotJSON) => Promise<string[]>;
declare const pushMySQLSchema: (imports: Record<string, unknown>, drizzleInstance: MySql2Database<any>, databaseName: string) => Promise<{
    hasDataLoss: boolean;
    warnings: string[];
    statementsToExecute: string[];
    apply: () => Promise<void>;
}>;
declare const startStudioMySQLServer: (imports: Record<string, unknown>, credentials: MysqlCredentials, options?: {
    host?: string;
    port?: number;
    casing?: CasingType;
}) => Promise<void>;
declare const generateSingleStoreDrizzleJson: (imports: Record<string, unknown>, prevId?: string, casing?: CasingType) => Promise<SingleStoreSchema>;
declare const generateSingleStoreMigration: (prev: DrizzleSingleStoreSnapshotJSON, cur: DrizzleSingleStoreSnapshotJSON) => Promise<string[]>;
declare const pushSingleStoreSchema: (imports: Record<string, unknown>, drizzleInstance: SingleStoreDriverDatabase<any>, databaseName: string) => Promise<{
    hasDataLoss: boolean;
    warnings: string[];
    statementsToExecute: string[];
    apply: () => Promise<void>;
}>;
declare const startStudioSingleStoreServer: (imports: Record<string, unknown>, credentials: SingleStoreCredentials, options?: {
    host?: string;
    port?: number;
    casing?: CasingType;
}) => Promise<void>;
declare const upPgSnapshot: (snapshot: Record<string, unknown>) => {
    version: "7";
    dialect: "postgresql";
    tables: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        indexes: Record<string, {
            name: string;
            columns: {
                expression: string;
                isExpression: boolean;
                asc: boolean;
                nulls?: string | undefined;
                opclass?: string | undefined;
            }[];
            isUnique: boolean;
            method: string;
            concurrently: boolean;
            with?: Record<string, any> | undefined;
            where?: string | undefined;
        }>;
        foreignKeys: Record<string, {
            name: string;
            tableFrom: string;
            columnsFrom: string[];
            tableTo: string;
            columnsTo: string[];
            schemaTo?: string | undefined;
            onUpdate?: string | undefined;
            onDelete?: string | undefined;
        }>;
        compositePrimaryKeys: Record<string, {
            name: string;
            columns: string[];
        }>;
        uniqueConstraints: Record<string, {
            name: string;
            columns: string[];
            nullsNotDistinct: boolean;
        }>;
        policies: Record<string, {
            name: string;
            schema?: string | undefined;
            as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
            for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
            to?: string[] | undefined;
            using?: string | undefined;
            withCheck?: string | undefined;
            on?: string | undefined;
        }>;
        checkConstraints: Record<string, {
            value: string;
            name: string;
        }>;
        isRLSEnabled: boolean;
    }>;
    policies: Record<string, {
        name: string;
        schema?: string | undefined;
        as?: "PERMISSIVE" | "RESTRICTIVE" | undefined;
        for?: "ALL" | "SELECT" | "INSERT" | "UPDATE" | "DELETE" | undefined;
        to?: string[] | undefined;
        using?: string | undefined;
        withCheck?: string | undefined;
        on?: string | undefined;
    }>;
    enums: Record<string, {
        values: string[];
        name: string;
        schema: string;
    }>;
    schemas: Record<string, string>;
    views: Record<string, {
        name: string;
        schema: string;
        columns: Record<string, {
            type: string;
            name: string;
            primaryKey: boolean;
            notNull: boolean;
            typeSchema?: string | undefined;
            default?: any;
            isUnique?: any;
            uniqueName?: string | undefined;
            nullsNotDistinct?: boolean | undefined;
            generated?: {
                type: "stored";
                as: string;
            } | undefined;
            identity?: {
                type: "always" | "byDefault";
                name: string;
                schema: string;
                increment?: string | undefined;
                minValue?: string | undefined;
                maxValue?: string | undefined;
                startWith?: string | undefined;
                cache?: string | undefined;
                cycle?: boolean | undefined;
            } | undefined;
        }>;
        materialized: boolean;
        isExisting: boolean;
        with?: {
            checkOption?: "local" | "cascaded" | undefined;
            securityBarrier?: boolean | undefined;
            securityInvoker?: boolean | undefined;
            fillfactor?: number | undefined;
            toastTupleTarget?: number | undefined;
            parallelWorkers?: number | undefined;
            autovacuumEnabled?: boolean | undefined;
            vacuumIndexCleanup?: "on" | "auto" | "off" | undefined;
            vacuumTruncate?: boolean | undefined;
            autovacuumVacuumThreshold?: number | undefined;
            autovacuumVacuumScaleFactor?: number | undefined;
            autovacuumVacuumCostDelay?: number | undefined;
            autovacuumVacuumCostLimit?: number | undefined;
            autovacuumFreezeMinAge?: number | undefined;
            autovacuumFreezeMaxAge?: number | undefined;
            autovacuumFreezeTableAge?: number | undefined;
            autovacuumMultixactFreezeMinAge?: number | undefined;
            autovacuumMultixactFreezeMaxAge?: number | undefined;
            autovacuumMultixactFreezeTableAge?: number | undefined;
            logAutovacuumMinDuration?: number | undefined;
            userCatalogTable?: boolean | undefined;
        } | undefined;
        using?: string | undefined;
        definition?: string | undefined;
        withNoData?: boolean | undefined;
        tablespace?: string | undefined;
    }>;
    sequences: Record<string, {
        name: string;
        schema: string;
        increment?: string | undefined;
        minValue?: string | undefined;
        maxValue?: string | undefined;
        startWith?: string | undefined;
        cache?: string | undefined;
        cycle?: boolean | undefined;
    }>;
    roles: Record<string, {
        name: string;
        createDb?: boolean | undefined;
        createRole?: boolean | undefined;
        inherit?: boolean | undefined;
    }>;
    _meta: {
        tables: Record<string, string>;
        columns: Record<string, string>;
        schemas: Record<string, string>;
    };
    id: string;
    prevId: string;
    internal?: {
        tables: Record<string, {
            columns: Record<string, {
                isArray?: boolean | undefined;
                dimensions?: number | undefined;
                rawType?: string | undefined;
                isDefaultAnExpression?: boolean | undefined;
            } | undefined>;
        } | undefined>;
    } | undefined;
} | Record<string, unknown>;

export { type DrizzleMySQLSnapshotJSON, type DrizzleSQLiteSnapshotJSON, type DrizzleSingleStoreSnapshotJSON, type DrizzleSnapshotJSON, generateDrizzleJson, generateMigration, generateMySQLDrizzleJson, generateMySQLMigration, generateSQLiteDrizzleJson, generateSQLiteMigration, generateSingleStoreDrizzleJson, generateSingleStoreMigration, pushMySQLSchema, pushSQLiteSchema, pushSchema, pushSingleStoreSchema, startStudioMySQLServer, startStudioPostgresServer, startStudioSQLiteServer, startStudioSingleStoreServer, upPgSnapshot };
