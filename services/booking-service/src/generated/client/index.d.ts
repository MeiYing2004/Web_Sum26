
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Booking
 * 
 */
export type Booking = $Result.DefaultSelection<Prisma.$BookingPayload>
/**
 * Model Voucher
 * 
 */
export type Voucher = $Result.DefaultSelection<Prisma.$VoucherPayload>
/**
 * Model VoucherUsage
 * 
 */
export type VoucherUsage = $Result.DefaultSelection<Prisma.$VoucherUsagePayload>
/**
 * Model Passenger
 * 
 */
export type Passenger = $Result.DefaultSelection<Prisma.$PassengerPayload>
/**
 * Model StatusLog
 * 
 */
export type StatusLog = $Result.DefaultSelection<Prisma.$StatusLogPayload>
/**
 * Model Review
 * 
 */
export type Review = $Result.DefaultSelection<Prisma.$ReviewPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Bookings
 * const bookings = await prisma.booking.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Bookings
   * const bookings = await prisma.booking.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.booking`: Exposes CRUD operations for the **Booking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bookings
    * const bookings = await prisma.booking.findMany()
    * ```
    */
  get booking(): Prisma.BookingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.voucher`: Exposes CRUD operations for the **Voucher** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Vouchers
    * const vouchers = await prisma.voucher.findMany()
    * ```
    */
  get voucher(): Prisma.VoucherDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.voucherUsage`: Exposes CRUD operations for the **VoucherUsage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more VoucherUsages
    * const voucherUsages = await prisma.voucherUsage.findMany()
    * ```
    */
  get voucherUsage(): Prisma.VoucherUsageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.passenger`: Exposes CRUD operations for the **Passenger** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Passengers
    * const passengers = await prisma.passenger.findMany()
    * ```
    */
  get passenger(): Prisma.PassengerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.statusLog`: Exposes CRUD operations for the **StatusLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StatusLogs
    * const statusLogs = await prisma.statusLog.findMany()
    * ```
    */
  get statusLog(): Prisma.StatusLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.review`: Exposes CRUD operations for the **Review** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reviews
    * const reviews = await prisma.review.findMany()
    * ```
    */
  get review(): Prisma.ReviewDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Booking: 'Booking',
    Voucher: 'Voucher',
    VoucherUsage: 'VoucherUsage',
    Passenger: 'Passenger',
    StatusLog: 'StatusLog',
    Review: 'Review'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "booking" | "voucher" | "voucherUsage" | "passenger" | "statusLog" | "review"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Booking: {
        payload: Prisma.$BookingPayload<ExtArgs>
        fields: Prisma.BookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findFirst: {
            args: Prisma.BookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          findMany: {
            args: Prisma.BookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          create: {
            args: Prisma.BookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          createMany: {
            args: Prisma.BookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BookingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          delete: {
            args: Prisma.BookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          update: {
            args: Prisma.BookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          deleteMany: {
            args: Prisma.BookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BookingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>[]
          }
          upsert: {
            args: Prisma.BookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BookingPayload>
          }
          aggregate: {
            args: Prisma.BookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBooking>
          }
          groupBy: {
            args: Prisma.BookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<BookingGroupByOutputType>[]
          }
          count: {
            args: Prisma.BookingCountArgs<ExtArgs>
            result: $Utils.Optional<BookingCountAggregateOutputType> | number
          }
        }
      }
      Voucher: {
        payload: Prisma.$VoucherPayload<ExtArgs>
        fields: Prisma.VoucherFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VoucherFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VoucherFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          findFirst: {
            args: Prisma.VoucherFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VoucherFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          findMany: {
            args: Prisma.VoucherFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>[]
          }
          create: {
            args: Prisma.VoucherCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          createMany: {
            args: Prisma.VoucherCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VoucherCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>[]
          }
          delete: {
            args: Prisma.VoucherDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          update: {
            args: Prisma.VoucherUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          deleteMany: {
            args: Prisma.VoucherDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VoucherUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VoucherUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>[]
          }
          upsert: {
            args: Prisma.VoucherUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherPayload>
          }
          aggregate: {
            args: Prisma.VoucherAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVoucher>
          }
          groupBy: {
            args: Prisma.VoucherGroupByArgs<ExtArgs>
            result: $Utils.Optional<VoucherGroupByOutputType>[]
          }
          count: {
            args: Prisma.VoucherCountArgs<ExtArgs>
            result: $Utils.Optional<VoucherCountAggregateOutputType> | number
          }
        }
      }
      VoucherUsage: {
        payload: Prisma.$VoucherUsagePayload<ExtArgs>
        fields: Prisma.VoucherUsageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.VoucherUsageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.VoucherUsageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          findFirst: {
            args: Prisma.VoucherUsageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.VoucherUsageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          findMany: {
            args: Prisma.VoucherUsageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>[]
          }
          create: {
            args: Prisma.VoucherUsageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          createMany: {
            args: Prisma.VoucherUsageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.VoucherUsageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>[]
          }
          delete: {
            args: Prisma.VoucherUsageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          update: {
            args: Prisma.VoucherUsageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          deleteMany: {
            args: Prisma.VoucherUsageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.VoucherUsageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.VoucherUsageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>[]
          }
          upsert: {
            args: Prisma.VoucherUsageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$VoucherUsagePayload>
          }
          aggregate: {
            args: Prisma.VoucherUsageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateVoucherUsage>
          }
          groupBy: {
            args: Prisma.VoucherUsageGroupByArgs<ExtArgs>
            result: $Utils.Optional<VoucherUsageGroupByOutputType>[]
          }
          count: {
            args: Prisma.VoucherUsageCountArgs<ExtArgs>
            result: $Utils.Optional<VoucherUsageCountAggregateOutputType> | number
          }
        }
      }
      Passenger: {
        payload: Prisma.$PassengerPayload<ExtArgs>
        fields: Prisma.PassengerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PassengerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PassengerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          findFirst: {
            args: Prisma.PassengerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PassengerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          findMany: {
            args: Prisma.PassengerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[]
          }
          create: {
            args: Prisma.PassengerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          createMany: {
            args: Prisma.PassengerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PassengerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[]
          }
          delete: {
            args: Prisma.PassengerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          update: {
            args: Prisma.PassengerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          deleteMany: {
            args: Prisma.PassengerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PassengerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PassengerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>[]
          }
          upsert: {
            args: Prisma.PassengerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PassengerPayload>
          }
          aggregate: {
            args: Prisma.PassengerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePassenger>
          }
          groupBy: {
            args: Prisma.PassengerGroupByArgs<ExtArgs>
            result: $Utils.Optional<PassengerGroupByOutputType>[]
          }
          count: {
            args: Prisma.PassengerCountArgs<ExtArgs>
            result: $Utils.Optional<PassengerCountAggregateOutputType> | number
          }
        }
      }
      StatusLog: {
        payload: Prisma.$StatusLogPayload<ExtArgs>
        fields: Prisma.StatusLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StatusLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StatusLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          findFirst: {
            args: Prisma.StatusLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StatusLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          findMany: {
            args: Prisma.StatusLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>[]
          }
          create: {
            args: Prisma.StatusLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          createMany: {
            args: Prisma.StatusLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StatusLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>[]
          }
          delete: {
            args: Prisma.StatusLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          update: {
            args: Prisma.StatusLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          deleteMany: {
            args: Prisma.StatusLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StatusLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StatusLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>[]
          }
          upsert: {
            args: Prisma.StatusLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StatusLogPayload>
          }
          aggregate: {
            args: Prisma.StatusLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStatusLog>
          }
          groupBy: {
            args: Prisma.StatusLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<StatusLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.StatusLogCountArgs<ExtArgs>
            result: $Utils.Optional<StatusLogCountAggregateOutputType> | number
          }
        }
      }
      Review: {
        payload: Prisma.$ReviewPayload<ExtArgs>
        fields: Prisma.ReviewFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReviewFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReviewFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          findFirst: {
            args: Prisma.ReviewFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReviewFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          findMany: {
            args: Prisma.ReviewFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>[]
          }
          create: {
            args: Prisma.ReviewCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          createMany: {
            args: Prisma.ReviewCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReviewCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>[]
          }
          delete: {
            args: Prisma.ReviewDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          update: {
            args: Prisma.ReviewUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          deleteMany: {
            args: Prisma.ReviewDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReviewUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ReviewUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>[]
          }
          upsert: {
            args: Prisma.ReviewUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReviewPayload>
          }
          aggregate: {
            args: Prisma.ReviewAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReview>
          }
          groupBy: {
            args: Prisma.ReviewGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReviewGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReviewCountArgs<ExtArgs>
            result: $Utils.Optional<ReviewCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    booking?: BookingOmit
    voucher?: VoucherOmit
    voucherUsage?: VoucherUsageOmit
    passenger?: PassengerOmit
    statusLog?: StatusLogOmit
    review?: ReviewOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type BookingCountOutputType
   */

  export type BookingCountOutputType = {
    passengers: number
    statusLogs: number
    voucherUsages: number
  }

  export type BookingCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    passengers?: boolean | BookingCountOutputTypeCountPassengersArgs
    statusLogs?: boolean | BookingCountOutputTypeCountStatusLogsArgs
    voucherUsages?: boolean | BookingCountOutputTypeCountVoucherUsagesArgs
  }

  // Custom InputTypes
  /**
   * BookingCountOutputType without action
   */
  export type BookingCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BookingCountOutputType
     */
    select?: BookingCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * BookingCountOutputType without action
   */
  export type BookingCountOutputTypeCountPassengersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PassengerWhereInput
  }

  /**
   * BookingCountOutputType without action
   */
  export type BookingCountOutputTypeCountStatusLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatusLogWhereInput
  }

  /**
   * BookingCountOutputType without action
   */
  export type BookingCountOutputTypeCountVoucherUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VoucherUsageWhereInput
  }


  /**
   * Count Type VoucherCountOutputType
   */

  export type VoucherCountOutputType = {
    bookings: number
    usages: number
  }

  export type VoucherCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | VoucherCountOutputTypeCountBookingsArgs
    usages?: boolean | VoucherCountOutputTypeCountUsagesArgs
  }

  // Custom InputTypes
  /**
   * VoucherCountOutputType without action
   */
  export type VoucherCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherCountOutputType
     */
    select?: VoucherCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * VoucherCountOutputType without action
   */
  export type VoucherCountOutputTypeCountBookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
  }

  /**
   * VoucherCountOutputType without action
   */
  export type VoucherCountOutputTypeCountUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VoucherUsageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Booking
   */

  export type AggregateBooking = {
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  export type BookingAvgAggregateOutputType = {
    ticketSubtotal: number | null
    serviceFee: number | null
    discountAmount: number | null
    totalAmount: number | null
  }

  export type BookingSumAggregateOutputType = {
    ticketSubtotal: number | null
    serviceFee: number | null
    discountAmount: number | null
    totalAmount: number | null
  }

  export type BookingMinAggregateOutputType = {
    id: string | null
    bookingCode: string | null
    tripId: string | null
    userId: string | null
    guestEmail: string | null
    status: string | null
    paymentStatus: string | null
    holdToken: string | null
    ticketSubtotal: number | null
    serviceFee: number | null
    discountAmount: number | null
    totalAmount: number | null
    voucherId: string | null
    voucherCode: string | null
    paymentDeadline: Date | null
    routeName: string | null
    origin: string | null
    destination: string | null
    operatorName: string | null
    pickupPoint: string | null
    dropoffPoint: string | null
    departureTime: string | null
    busPlate: string | null
    tripType: string | null
    checkedInAt: Date | null
    checkedInByUserId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingMaxAggregateOutputType = {
    id: string | null
    bookingCode: string | null
    tripId: string | null
    userId: string | null
    guestEmail: string | null
    status: string | null
    paymentStatus: string | null
    holdToken: string | null
    ticketSubtotal: number | null
    serviceFee: number | null
    discountAmount: number | null
    totalAmount: number | null
    voucherId: string | null
    voucherCode: string | null
    paymentDeadline: Date | null
    routeName: string | null
    origin: string | null
    destination: string | null
    operatorName: string | null
    pickupPoint: string | null
    dropoffPoint: string | null
    departureTime: string | null
    busPlate: string | null
    tripType: string | null
    checkedInAt: Date | null
    checkedInByUserId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BookingCountAggregateOutputType = {
    id: number
    bookingCode: number
    tripId: number
    userId: number
    guestEmail: number
    status: number
    paymentStatus: number
    holdToken: number
    ticketSubtotal: number
    serviceFee: number
    discountAmount: number
    totalAmount: number
    voucherId: number
    voucherCode: number
    paymentDeadline: number
    routeName: number
    origin: number
    destination: number
    operatorName: number
    pickupPoint: number
    dropoffPoint: number
    departureTime: number
    busPlate: number
    tripType: number
    checkedInAt: number
    checkedInByUserId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BookingAvgAggregateInputType = {
    ticketSubtotal?: true
    serviceFee?: true
    discountAmount?: true
    totalAmount?: true
  }

  export type BookingSumAggregateInputType = {
    ticketSubtotal?: true
    serviceFee?: true
    discountAmount?: true
    totalAmount?: true
  }

  export type BookingMinAggregateInputType = {
    id?: true
    bookingCode?: true
    tripId?: true
    userId?: true
    guestEmail?: true
    status?: true
    paymentStatus?: true
    holdToken?: true
    ticketSubtotal?: true
    serviceFee?: true
    discountAmount?: true
    totalAmount?: true
    voucherId?: true
    voucherCode?: true
    paymentDeadline?: true
    routeName?: true
    origin?: true
    destination?: true
    operatorName?: true
    pickupPoint?: true
    dropoffPoint?: true
    departureTime?: true
    busPlate?: true
    tripType?: true
    checkedInAt?: true
    checkedInByUserId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingMaxAggregateInputType = {
    id?: true
    bookingCode?: true
    tripId?: true
    userId?: true
    guestEmail?: true
    status?: true
    paymentStatus?: true
    holdToken?: true
    ticketSubtotal?: true
    serviceFee?: true
    discountAmount?: true
    totalAmount?: true
    voucherId?: true
    voucherCode?: true
    paymentDeadline?: true
    routeName?: true
    origin?: true
    destination?: true
    operatorName?: true
    pickupPoint?: true
    dropoffPoint?: true
    departureTime?: true
    busPlate?: true
    tripType?: true
    checkedInAt?: true
    checkedInByUserId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BookingCountAggregateInputType = {
    id?: true
    bookingCode?: true
    tripId?: true
    userId?: true
    guestEmail?: true
    status?: true
    paymentStatus?: true
    holdToken?: true
    ticketSubtotal?: true
    serviceFee?: true
    discountAmount?: true
    totalAmount?: true
    voucherId?: true
    voucherCode?: true
    paymentDeadline?: true
    routeName?: true
    origin?: true
    destination?: true
    operatorName?: true
    pickupPoint?: true
    dropoffPoint?: true
    departureTime?: true
    busPlate?: true
    tripType?: true
    checkedInAt?: true
    checkedInByUserId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Booking to aggregate.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bookings
    **/
    _count?: true | BookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BookingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BookingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BookingMaxAggregateInputType
  }

  export type GetBookingAggregateType<T extends BookingAggregateArgs> = {
        [P in keyof T & keyof AggregateBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBooking[P]>
      : GetScalarType<T[P], AggregateBooking[P]>
  }




  export type BookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithAggregationInput | BookingOrderByWithAggregationInput[]
    by: BookingScalarFieldEnum[] | BookingScalarFieldEnum
    having?: BookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BookingCountAggregateInputType | true
    _avg?: BookingAvgAggregateInputType
    _sum?: BookingSumAggregateInputType
    _min?: BookingMinAggregateInputType
    _max?: BookingMaxAggregateInputType
  }

  export type BookingGroupByOutputType = {
    id: string
    bookingCode: string
    tripId: string
    userId: string | null
    guestEmail: string
    status: string
    paymentStatus: string
    holdToken: string | null
    ticketSubtotal: number
    serviceFee: number
    discountAmount: number
    totalAmount: number
    voucherId: string | null
    voucherCode: string | null
    paymentDeadline: Date | null
    routeName: string
    origin: string
    destination: string
    operatorName: string
    pickupPoint: string
    dropoffPoint: string
    departureTime: string
    busPlate: string
    tripType: string
    checkedInAt: Date | null
    checkedInByUserId: string | null
    createdAt: Date
    updatedAt: Date
    _count: BookingCountAggregateOutputType | null
    _avg: BookingAvgAggregateOutputType | null
    _sum: BookingSumAggregateOutputType | null
    _min: BookingMinAggregateOutputType | null
    _max: BookingMaxAggregateOutputType | null
  }

  type GetBookingGroupByPayload<T extends BookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BookingGroupByOutputType[P]>
            : GetScalarType<T[P], BookingGroupByOutputType[P]>
        }
      >
    >


  export type BookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingCode?: boolean
    tripId?: boolean
    userId?: boolean
    guestEmail?: boolean
    status?: boolean
    paymentStatus?: boolean
    holdToken?: boolean
    ticketSubtotal?: boolean
    serviceFee?: boolean
    discountAmount?: boolean
    totalAmount?: boolean
    voucherId?: boolean
    voucherCode?: boolean
    paymentDeadline?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    operatorName?: boolean
    pickupPoint?: boolean
    dropoffPoint?: boolean
    departureTime?: boolean
    busPlate?: boolean
    tripType?: boolean
    checkedInAt?: boolean
    checkedInByUserId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    passengers?: boolean | Booking$passengersArgs<ExtArgs>
    statusLogs?: boolean | Booking$statusLogsArgs<ExtArgs>
    review?: boolean | Booking$reviewArgs<ExtArgs>
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
    voucherUsages?: boolean | Booking$voucherUsagesArgs<ExtArgs>
    _count?: boolean | BookingCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingCode?: boolean
    tripId?: boolean
    userId?: boolean
    guestEmail?: boolean
    status?: boolean
    paymentStatus?: boolean
    holdToken?: boolean
    ticketSubtotal?: boolean
    serviceFee?: boolean
    discountAmount?: boolean
    totalAmount?: boolean
    voucherId?: boolean
    voucherCode?: boolean
    paymentDeadline?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    operatorName?: boolean
    pickupPoint?: boolean
    dropoffPoint?: boolean
    departureTime?: boolean
    busPlate?: boolean
    tripType?: boolean
    checkedInAt?: boolean
    checkedInByUserId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingCode?: boolean
    tripId?: boolean
    userId?: boolean
    guestEmail?: boolean
    status?: boolean
    paymentStatus?: boolean
    holdToken?: boolean
    ticketSubtotal?: boolean
    serviceFee?: boolean
    discountAmount?: boolean
    totalAmount?: boolean
    voucherId?: boolean
    voucherCode?: boolean
    paymentDeadline?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    operatorName?: boolean
    pickupPoint?: boolean
    dropoffPoint?: boolean
    departureTime?: boolean
    busPlate?: boolean
    tripType?: boolean
    checkedInAt?: boolean
    checkedInByUserId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
  }, ExtArgs["result"]["booking"]>

  export type BookingSelectScalar = {
    id?: boolean
    bookingCode?: boolean
    tripId?: boolean
    userId?: boolean
    guestEmail?: boolean
    status?: boolean
    paymentStatus?: boolean
    holdToken?: boolean
    ticketSubtotal?: boolean
    serviceFee?: boolean
    discountAmount?: boolean
    totalAmount?: boolean
    voucherId?: boolean
    voucherCode?: boolean
    paymentDeadline?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    operatorName?: boolean
    pickupPoint?: boolean
    dropoffPoint?: boolean
    departureTime?: boolean
    busPlate?: boolean
    tripType?: boolean
    checkedInAt?: boolean
    checkedInByUserId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type BookingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingCode" | "tripId" | "userId" | "guestEmail" | "status" | "paymentStatus" | "holdToken" | "ticketSubtotal" | "serviceFee" | "discountAmount" | "totalAmount" | "voucherId" | "voucherCode" | "paymentDeadline" | "routeName" | "origin" | "destination" | "operatorName" | "pickupPoint" | "dropoffPoint" | "departureTime" | "busPlate" | "tripType" | "checkedInAt" | "checkedInByUserId" | "createdAt" | "updatedAt", ExtArgs["result"]["booking"]>
  export type BookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    passengers?: boolean | Booking$passengersArgs<ExtArgs>
    statusLogs?: boolean | Booking$statusLogsArgs<ExtArgs>
    review?: boolean | Booking$reviewArgs<ExtArgs>
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
    voucherUsages?: boolean | Booking$voucherUsagesArgs<ExtArgs>
    _count?: boolean | BookingCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type BookingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
  }
  export type BookingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    voucher?: boolean | Booking$voucherArgs<ExtArgs>
  }

  export type $BookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Booking"
    objects: {
      passengers: Prisma.$PassengerPayload<ExtArgs>[]
      statusLogs: Prisma.$StatusLogPayload<ExtArgs>[]
      review: Prisma.$ReviewPayload<ExtArgs> | null
      voucher: Prisma.$VoucherPayload<ExtArgs> | null
      voucherUsages: Prisma.$VoucherUsagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingCode: string
      tripId: string
      userId: string | null
      guestEmail: string
      status: string
      paymentStatus: string
      holdToken: string | null
      ticketSubtotal: number
      serviceFee: number
      discountAmount: number
      totalAmount: number
      voucherId: string | null
      voucherCode: string | null
      paymentDeadline: Date | null
      routeName: string
      origin: string
      destination: string
      operatorName: string
      pickupPoint: string
      dropoffPoint: string
      departureTime: string
      busPlate: string
      tripType: string
      checkedInAt: Date | null
      checkedInByUserId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["booking"]>
    composites: {}
  }

  type BookingGetPayload<S extends boolean | null | undefined | BookingDefaultArgs> = $Result.GetResult<Prisma.$BookingPayload, S>

  type BookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BookingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BookingCountAggregateInputType | true
    }

  export interface BookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Booking'], meta: { name: 'Booking' } }
    /**
     * Find zero or one Booking that matches the filter.
     * @param {BookingFindUniqueArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BookingFindUniqueArgs>(args: SelectSubset<T, BookingFindUniqueArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Booking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BookingFindUniqueOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BookingFindUniqueOrThrowArgs>(args: SelectSubset<T, BookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Booking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BookingFindFirstArgs>(args?: SelectSubset<T, BookingFindFirstArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Booking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindFirstOrThrowArgs} args - Arguments to find a Booking
     * @example
     * // Get one Booking
     * const booking = await prisma.booking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BookingFindFirstOrThrowArgs>(args?: SelectSubset<T, BookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Bookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bookings
     * const bookings = await prisma.booking.findMany()
     * 
     * // Get first 10 Bookings
     * const bookings = await prisma.booking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bookingWithIdOnly = await prisma.booking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BookingFindManyArgs>(args?: SelectSubset<T, BookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Booking.
     * @param {BookingCreateArgs} args - Arguments to create a Booking.
     * @example
     * // Create one Booking
     * const Booking = await prisma.booking.create({
     *   data: {
     *     // ... data to create a Booking
     *   }
     * })
     * 
     */
    create<T extends BookingCreateArgs>(args: SelectSubset<T, BookingCreateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Bookings.
     * @param {BookingCreateManyArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BookingCreateManyArgs>(args?: SelectSubset<T, BookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bookings and returns the data saved in the database.
     * @param {BookingCreateManyAndReturnArgs} args - Arguments to create many Bookings.
     * @example
     * // Create many Bookings
     * const booking = await prisma.booking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bookings and only return the `id`
     * const bookingWithIdOnly = await prisma.booking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BookingCreateManyAndReturnArgs>(args?: SelectSubset<T, BookingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Booking.
     * @param {BookingDeleteArgs} args - Arguments to delete one Booking.
     * @example
     * // Delete one Booking
     * const Booking = await prisma.booking.delete({
     *   where: {
     *     // ... filter to delete one Booking
     *   }
     * })
     * 
     */
    delete<T extends BookingDeleteArgs>(args: SelectSubset<T, BookingDeleteArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Booking.
     * @param {BookingUpdateArgs} args - Arguments to update one Booking.
     * @example
     * // Update one Booking
     * const booking = await prisma.booking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BookingUpdateArgs>(args: SelectSubset<T, BookingUpdateArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Bookings.
     * @param {BookingDeleteManyArgs} args - Arguments to filter Bookings to delete.
     * @example
     * // Delete a few Bookings
     * const { count } = await prisma.booking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BookingDeleteManyArgs>(args?: SelectSubset<T, BookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BookingUpdateManyArgs>(args: SelectSubset<T, BookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bookings and returns the data updated in the database.
     * @param {BookingUpdateManyAndReturnArgs} args - Arguments to update many Bookings.
     * @example
     * // Update many Bookings
     * const booking = await prisma.booking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Bookings and only return the `id`
     * const bookingWithIdOnly = await prisma.booking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BookingUpdateManyAndReturnArgs>(args: SelectSubset<T, BookingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Booking.
     * @param {BookingUpsertArgs} args - Arguments to update or create a Booking.
     * @example
     * // Update or create a Booking
     * const booking = await prisma.booking.upsert({
     *   create: {
     *     // ... data to create a Booking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Booking we want to update
     *   }
     * })
     */
    upsert<T extends BookingUpsertArgs>(args: SelectSubset<T, BookingUpsertArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Bookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingCountArgs} args - Arguments to filter Bookings to count.
     * @example
     * // Count the number of Bookings
     * const count = await prisma.booking.count({
     *   where: {
     *     // ... the filter for the Bookings we want to count
     *   }
     * })
    **/
    count<T extends BookingCountArgs>(
      args?: Subset<T, BookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BookingAggregateArgs>(args: Subset<T, BookingAggregateArgs>): Prisma.PrismaPromise<GetBookingAggregateType<T>>

    /**
     * Group by Booking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BookingGroupByArgs['orderBy'] }
        : { orderBy?: BookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Booking model
   */
  readonly fields: BookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Booking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    passengers<T extends Booking$passengersArgs<ExtArgs> = {}>(args?: Subset<T, Booking$passengersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    statusLogs<T extends Booking$statusLogsArgs<ExtArgs> = {}>(args?: Subset<T, Booking$statusLogsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    review<T extends Booking$reviewArgs<ExtArgs> = {}>(args?: Subset<T, Booking$reviewArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    voucher<T extends Booking$voucherArgs<ExtArgs> = {}>(args?: Subset<T, Booking$voucherArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    voucherUsages<T extends Booking$voucherUsagesArgs<ExtArgs> = {}>(args?: Subset<T, Booking$voucherUsagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Booking model
   */
  interface BookingFieldRefs {
    readonly id: FieldRef<"Booking", 'String'>
    readonly bookingCode: FieldRef<"Booking", 'String'>
    readonly tripId: FieldRef<"Booking", 'String'>
    readonly userId: FieldRef<"Booking", 'String'>
    readonly guestEmail: FieldRef<"Booking", 'String'>
    readonly status: FieldRef<"Booking", 'String'>
    readonly paymentStatus: FieldRef<"Booking", 'String'>
    readonly holdToken: FieldRef<"Booking", 'String'>
    readonly ticketSubtotal: FieldRef<"Booking", 'Float'>
    readonly serviceFee: FieldRef<"Booking", 'Float'>
    readonly discountAmount: FieldRef<"Booking", 'Float'>
    readonly totalAmount: FieldRef<"Booking", 'Float'>
    readonly voucherId: FieldRef<"Booking", 'String'>
    readonly voucherCode: FieldRef<"Booking", 'String'>
    readonly paymentDeadline: FieldRef<"Booking", 'DateTime'>
    readonly routeName: FieldRef<"Booking", 'String'>
    readonly origin: FieldRef<"Booking", 'String'>
    readonly destination: FieldRef<"Booking", 'String'>
    readonly operatorName: FieldRef<"Booking", 'String'>
    readonly pickupPoint: FieldRef<"Booking", 'String'>
    readonly dropoffPoint: FieldRef<"Booking", 'String'>
    readonly departureTime: FieldRef<"Booking", 'String'>
    readonly busPlate: FieldRef<"Booking", 'String'>
    readonly tripType: FieldRef<"Booking", 'String'>
    readonly checkedInAt: FieldRef<"Booking", 'DateTime'>
    readonly checkedInByUserId: FieldRef<"Booking", 'String'>
    readonly createdAt: FieldRef<"Booking", 'DateTime'>
    readonly updatedAt: FieldRef<"Booking", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Booking findUnique
   */
  export type BookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findUniqueOrThrow
   */
  export type BookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking findFirst
   */
  export type BookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findFirstOrThrow
   */
  export type BookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Booking to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bookings.
     */
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking findMany
   */
  export type BookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter, which Bookings to fetch.
     */
    where?: BookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bookings to fetch.
     */
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bookings.
     */
    cursor?: BookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bookings.
     */
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Booking create
   */
  export type BookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to create a Booking.
     */
    data: XOR<BookingCreateInput, BookingUncheckedCreateInput>
  }

  /**
   * Booking createMany
   */
  export type BookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Booking createManyAndReturn
   */
  export type BookingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * The data used to create many Bookings.
     */
    data: BookingCreateManyInput | BookingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Booking update
   */
  export type BookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The data needed to update a Booking.
     */
    data: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
    /**
     * Choose, which Booking to update.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking updateMany
   */
  export type BookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to update.
     */
    limit?: number
  }

  /**
   * Booking updateManyAndReturn
   */
  export type BookingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * The data used to update Bookings.
     */
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyInput>
    /**
     * Filter which Bookings to update
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Booking upsert
   */
  export type BookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * The filter to search for the Booking to update in case it exists.
     */
    where: BookingWhereUniqueInput
    /**
     * In case the Booking found by the `where` argument doesn't exist, create a new Booking with this data.
     */
    create: XOR<BookingCreateInput, BookingUncheckedCreateInput>
    /**
     * In case the Booking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BookingUpdateInput, BookingUncheckedUpdateInput>
  }

  /**
   * Booking delete
   */
  export type BookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    /**
     * Filter which Booking to delete.
     */
    where: BookingWhereUniqueInput
  }

  /**
   * Booking deleteMany
   */
  export type BookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bookings to delete
     */
    where?: BookingWhereInput
    /**
     * Limit how many Bookings to delete.
     */
    limit?: number
  }

  /**
   * Booking.passengers
   */
  export type Booking$passengersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    where?: PassengerWhereInput
    orderBy?: PassengerOrderByWithRelationInput | PassengerOrderByWithRelationInput[]
    cursor?: PassengerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[]
  }

  /**
   * Booking.statusLogs
   */
  export type Booking$statusLogsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    where?: StatusLogWhereInput
    orderBy?: StatusLogOrderByWithRelationInput | StatusLogOrderByWithRelationInput[]
    cursor?: StatusLogWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StatusLogScalarFieldEnum | StatusLogScalarFieldEnum[]
  }

  /**
   * Booking.review
   */
  export type Booking$reviewArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    where?: ReviewWhereInput
  }

  /**
   * Booking.voucher
   */
  export type Booking$voucherArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    where?: VoucherWhereInput
  }

  /**
   * Booking.voucherUsages
   */
  export type Booking$voucherUsagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    where?: VoucherUsageWhereInput
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    cursor?: VoucherUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VoucherUsageScalarFieldEnum | VoucherUsageScalarFieldEnum[]
  }

  /**
   * Booking without action
   */
  export type BookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
  }


  /**
   * Model Voucher
   */

  export type AggregateVoucher = {
    _count: VoucherCountAggregateOutputType | null
    _avg: VoucherAvgAggregateOutputType | null
    _sum: VoucherSumAggregateOutputType | null
    _min: VoucherMinAggregateOutputType | null
    _max: VoucherMaxAggregateOutputType | null
  }

  export type VoucherAvgAggregateOutputType = {
    discountValue: number | null
    maxDiscount: number | null
    minOrderValue: number | null
    usageLimit: number | null
    usagePerUser: number | null
    usedCount: number | null
  }

  export type VoucherSumAggregateOutputType = {
    discountValue: number | null
    maxDiscount: number | null
    minOrderValue: number | null
    usageLimit: number | null
    usagePerUser: number | null
    usedCount: number | null
  }

  export type VoucherMinAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    description: string | null
    discountType: string | null
    discountValue: number | null
    maxDiscount: number | null
    minOrderValue: number | null
    startDate: Date | null
    endDate: Date | null
    usageLimit: number | null
    usagePerUser: number | null
    applicableRoutes: string | null
    applicableBusCompanies: string | null
    applicableTripTypes: string | null
    requiresNewUser: boolean | null
    isActive: boolean | null
    usedCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VoucherMaxAggregateOutputType = {
    id: string | null
    code: string | null
    name: string | null
    description: string | null
    discountType: string | null
    discountValue: number | null
    maxDiscount: number | null
    minOrderValue: number | null
    startDate: Date | null
    endDate: Date | null
    usageLimit: number | null
    usagePerUser: number | null
    applicableRoutes: string | null
    applicableBusCompanies: string | null
    applicableTripTypes: string | null
    requiresNewUser: boolean | null
    isActive: boolean | null
    usedCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type VoucherCountAggregateOutputType = {
    id: number
    code: number
    name: number
    description: number
    discountType: number
    discountValue: number
    maxDiscount: number
    minOrderValue: number
    startDate: number
    endDate: number
    usageLimit: number
    usagePerUser: number
    applicableRoutes: number
    applicableBusCompanies: number
    applicableTripTypes: number
    requiresNewUser: number
    isActive: number
    usedCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type VoucherAvgAggregateInputType = {
    discountValue?: true
    maxDiscount?: true
    minOrderValue?: true
    usageLimit?: true
    usagePerUser?: true
    usedCount?: true
  }

  export type VoucherSumAggregateInputType = {
    discountValue?: true
    maxDiscount?: true
    minOrderValue?: true
    usageLimit?: true
    usagePerUser?: true
    usedCount?: true
  }

  export type VoucherMinAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    discountType?: true
    discountValue?: true
    maxDiscount?: true
    minOrderValue?: true
    startDate?: true
    endDate?: true
    usageLimit?: true
    usagePerUser?: true
    applicableRoutes?: true
    applicableBusCompanies?: true
    applicableTripTypes?: true
    requiresNewUser?: true
    isActive?: true
    usedCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VoucherMaxAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    discountType?: true
    discountValue?: true
    maxDiscount?: true
    minOrderValue?: true
    startDate?: true
    endDate?: true
    usageLimit?: true
    usagePerUser?: true
    applicableRoutes?: true
    applicableBusCompanies?: true
    applicableTripTypes?: true
    requiresNewUser?: true
    isActive?: true
    usedCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type VoucherCountAggregateInputType = {
    id?: true
    code?: true
    name?: true
    description?: true
    discountType?: true
    discountValue?: true
    maxDiscount?: true
    minOrderValue?: true
    startDate?: true
    endDate?: true
    usageLimit?: true
    usagePerUser?: true
    applicableRoutes?: true
    applicableBusCompanies?: true
    applicableTripTypes?: true
    requiresNewUser?: true
    isActive?: true
    usedCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type VoucherAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Voucher to aggregate.
     */
    where?: VoucherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VoucherOrderByWithRelationInput | VoucherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VoucherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Vouchers
    **/
    _count?: true | VoucherCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VoucherAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VoucherSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VoucherMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VoucherMaxAggregateInputType
  }

  export type GetVoucherAggregateType<T extends VoucherAggregateArgs> = {
        [P in keyof T & keyof AggregateVoucher]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVoucher[P]>
      : GetScalarType<T[P], AggregateVoucher[P]>
  }




  export type VoucherGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VoucherWhereInput
    orderBy?: VoucherOrderByWithAggregationInput | VoucherOrderByWithAggregationInput[]
    by: VoucherScalarFieldEnum[] | VoucherScalarFieldEnum
    having?: VoucherScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VoucherCountAggregateInputType | true
    _avg?: VoucherAvgAggregateInputType
    _sum?: VoucherSumAggregateInputType
    _min?: VoucherMinAggregateInputType
    _max?: VoucherMaxAggregateInputType
  }

  export type VoucherGroupByOutputType = {
    id: string
    code: string
    name: string
    description: string
    discountType: string
    discountValue: number
    maxDiscount: number | null
    minOrderValue: number
    startDate: Date
    endDate: Date
    usageLimit: number | null
    usagePerUser: number | null
    applicableRoutes: string
    applicableBusCompanies: string
    applicableTripTypes: string
    requiresNewUser: boolean
    isActive: boolean
    usedCount: number
    createdAt: Date
    updatedAt: Date
    _count: VoucherCountAggregateOutputType | null
    _avg: VoucherAvgAggregateOutputType | null
    _sum: VoucherSumAggregateOutputType | null
    _min: VoucherMinAggregateOutputType | null
    _max: VoucherMaxAggregateOutputType | null
  }

  type GetVoucherGroupByPayload<T extends VoucherGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VoucherGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VoucherGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VoucherGroupByOutputType[P]>
            : GetScalarType<T[P], VoucherGroupByOutputType[P]>
        }
      >
    >


  export type VoucherSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    discountType?: boolean
    discountValue?: boolean
    maxDiscount?: boolean
    minOrderValue?: boolean
    startDate?: boolean
    endDate?: boolean
    usageLimit?: boolean
    usagePerUser?: boolean
    applicableRoutes?: boolean
    applicableBusCompanies?: boolean
    applicableTripTypes?: boolean
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    bookings?: boolean | Voucher$bookingsArgs<ExtArgs>
    usages?: boolean | Voucher$usagesArgs<ExtArgs>
    _count?: boolean | VoucherCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["voucher"]>

  export type VoucherSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    discountType?: boolean
    discountValue?: boolean
    maxDiscount?: boolean
    minOrderValue?: boolean
    startDate?: boolean
    endDate?: boolean
    usageLimit?: boolean
    usagePerUser?: boolean
    applicableRoutes?: boolean
    applicableBusCompanies?: boolean
    applicableTripTypes?: boolean
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["voucher"]>

  export type VoucherSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    discountType?: boolean
    discountValue?: boolean
    maxDiscount?: boolean
    minOrderValue?: boolean
    startDate?: boolean
    endDate?: boolean
    usageLimit?: boolean
    usagePerUser?: boolean
    applicableRoutes?: boolean
    applicableBusCompanies?: boolean
    applicableTripTypes?: boolean
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["voucher"]>

  export type VoucherSelectScalar = {
    id?: boolean
    code?: boolean
    name?: boolean
    description?: boolean
    discountType?: boolean
    discountValue?: boolean
    maxDiscount?: boolean
    minOrderValue?: boolean
    startDate?: boolean
    endDate?: boolean
    usageLimit?: boolean
    usagePerUser?: boolean
    applicableRoutes?: boolean
    applicableBusCompanies?: boolean
    applicableTripTypes?: boolean
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type VoucherOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "name" | "description" | "discountType" | "discountValue" | "maxDiscount" | "minOrderValue" | "startDate" | "endDate" | "usageLimit" | "usagePerUser" | "applicableRoutes" | "applicableBusCompanies" | "applicableTripTypes" | "requiresNewUser" | "isActive" | "usedCount" | "createdAt" | "updatedAt", ExtArgs["result"]["voucher"]>
  export type VoucherInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    bookings?: boolean | Voucher$bookingsArgs<ExtArgs>
    usages?: boolean | Voucher$usagesArgs<ExtArgs>
    _count?: boolean | VoucherCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type VoucherIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type VoucherIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $VoucherPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Voucher"
    objects: {
      bookings: Prisma.$BookingPayload<ExtArgs>[]
      usages: Prisma.$VoucherUsagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      code: string
      name: string
      description: string
      discountType: string
      discountValue: number
      maxDiscount: number | null
      minOrderValue: number
      startDate: Date
      endDate: Date
      usageLimit: number | null
      usagePerUser: number | null
      applicableRoutes: string
      applicableBusCompanies: string
      applicableTripTypes: string
      requiresNewUser: boolean
      isActive: boolean
      usedCount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["voucher"]>
    composites: {}
  }

  type VoucherGetPayload<S extends boolean | null | undefined | VoucherDefaultArgs> = $Result.GetResult<Prisma.$VoucherPayload, S>

  type VoucherCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VoucherFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VoucherCountAggregateInputType | true
    }

  export interface VoucherDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Voucher'], meta: { name: 'Voucher' } }
    /**
     * Find zero or one Voucher that matches the filter.
     * @param {VoucherFindUniqueArgs} args - Arguments to find a Voucher
     * @example
     * // Get one Voucher
     * const voucher = await prisma.voucher.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VoucherFindUniqueArgs>(args: SelectSubset<T, VoucherFindUniqueArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Voucher that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VoucherFindUniqueOrThrowArgs} args - Arguments to find a Voucher
     * @example
     * // Get one Voucher
     * const voucher = await prisma.voucher.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VoucherFindUniqueOrThrowArgs>(args: SelectSubset<T, VoucherFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Voucher that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherFindFirstArgs} args - Arguments to find a Voucher
     * @example
     * // Get one Voucher
     * const voucher = await prisma.voucher.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VoucherFindFirstArgs>(args?: SelectSubset<T, VoucherFindFirstArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Voucher that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherFindFirstOrThrowArgs} args - Arguments to find a Voucher
     * @example
     * // Get one Voucher
     * const voucher = await prisma.voucher.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VoucherFindFirstOrThrowArgs>(args?: SelectSubset<T, VoucherFindFirstOrThrowArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Vouchers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Vouchers
     * const vouchers = await prisma.voucher.findMany()
     * 
     * // Get first 10 Vouchers
     * const vouchers = await prisma.voucher.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const voucherWithIdOnly = await prisma.voucher.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VoucherFindManyArgs>(args?: SelectSubset<T, VoucherFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Voucher.
     * @param {VoucherCreateArgs} args - Arguments to create a Voucher.
     * @example
     * // Create one Voucher
     * const Voucher = await prisma.voucher.create({
     *   data: {
     *     // ... data to create a Voucher
     *   }
     * })
     * 
     */
    create<T extends VoucherCreateArgs>(args: SelectSubset<T, VoucherCreateArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Vouchers.
     * @param {VoucherCreateManyArgs} args - Arguments to create many Vouchers.
     * @example
     * // Create many Vouchers
     * const voucher = await prisma.voucher.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VoucherCreateManyArgs>(args?: SelectSubset<T, VoucherCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Vouchers and returns the data saved in the database.
     * @param {VoucherCreateManyAndReturnArgs} args - Arguments to create many Vouchers.
     * @example
     * // Create many Vouchers
     * const voucher = await prisma.voucher.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Vouchers and only return the `id`
     * const voucherWithIdOnly = await prisma.voucher.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VoucherCreateManyAndReturnArgs>(args?: SelectSubset<T, VoucherCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Voucher.
     * @param {VoucherDeleteArgs} args - Arguments to delete one Voucher.
     * @example
     * // Delete one Voucher
     * const Voucher = await prisma.voucher.delete({
     *   where: {
     *     // ... filter to delete one Voucher
     *   }
     * })
     * 
     */
    delete<T extends VoucherDeleteArgs>(args: SelectSubset<T, VoucherDeleteArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Voucher.
     * @param {VoucherUpdateArgs} args - Arguments to update one Voucher.
     * @example
     * // Update one Voucher
     * const voucher = await prisma.voucher.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VoucherUpdateArgs>(args: SelectSubset<T, VoucherUpdateArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Vouchers.
     * @param {VoucherDeleteManyArgs} args - Arguments to filter Vouchers to delete.
     * @example
     * // Delete a few Vouchers
     * const { count } = await prisma.voucher.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VoucherDeleteManyArgs>(args?: SelectSubset<T, VoucherDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Vouchers
     * const voucher = await prisma.voucher.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VoucherUpdateManyArgs>(args: SelectSubset<T, VoucherUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Vouchers and returns the data updated in the database.
     * @param {VoucherUpdateManyAndReturnArgs} args - Arguments to update many Vouchers.
     * @example
     * // Update many Vouchers
     * const voucher = await prisma.voucher.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Vouchers and only return the `id`
     * const voucherWithIdOnly = await prisma.voucher.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VoucherUpdateManyAndReturnArgs>(args: SelectSubset<T, VoucherUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Voucher.
     * @param {VoucherUpsertArgs} args - Arguments to update or create a Voucher.
     * @example
     * // Update or create a Voucher
     * const voucher = await prisma.voucher.upsert({
     *   create: {
     *     // ... data to create a Voucher
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Voucher we want to update
     *   }
     * })
     */
    upsert<T extends VoucherUpsertArgs>(args: SelectSubset<T, VoucherUpsertArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Vouchers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherCountArgs} args - Arguments to filter Vouchers to count.
     * @example
     * // Count the number of Vouchers
     * const count = await prisma.voucher.count({
     *   where: {
     *     // ... the filter for the Vouchers we want to count
     *   }
     * })
    **/
    count<T extends VoucherCountArgs>(
      args?: Subset<T, VoucherCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VoucherCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Voucher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VoucherAggregateArgs>(args: Subset<T, VoucherAggregateArgs>): Prisma.PrismaPromise<GetVoucherAggregateType<T>>

    /**
     * Group by Voucher.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VoucherGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VoucherGroupByArgs['orderBy'] }
        : { orderBy?: VoucherGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VoucherGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVoucherGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Voucher model
   */
  readonly fields: VoucherFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Voucher.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VoucherClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    bookings<T extends Voucher$bookingsArgs<ExtArgs> = {}>(args?: Subset<T, Voucher$bookingsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    usages<T extends Voucher$usagesArgs<ExtArgs> = {}>(args?: Subset<T, Voucher$usagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Voucher model
   */
  interface VoucherFieldRefs {
    readonly id: FieldRef<"Voucher", 'String'>
    readonly code: FieldRef<"Voucher", 'String'>
    readonly name: FieldRef<"Voucher", 'String'>
    readonly description: FieldRef<"Voucher", 'String'>
    readonly discountType: FieldRef<"Voucher", 'String'>
    readonly discountValue: FieldRef<"Voucher", 'Float'>
    readonly maxDiscount: FieldRef<"Voucher", 'Float'>
    readonly minOrderValue: FieldRef<"Voucher", 'Float'>
    readonly startDate: FieldRef<"Voucher", 'DateTime'>
    readonly endDate: FieldRef<"Voucher", 'DateTime'>
    readonly usageLimit: FieldRef<"Voucher", 'Int'>
    readonly usagePerUser: FieldRef<"Voucher", 'Int'>
    readonly applicableRoutes: FieldRef<"Voucher", 'String'>
    readonly applicableBusCompanies: FieldRef<"Voucher", 'String'>
    readonly applicableTripTypes: FieldRef<"Voucher", 'String'>
    readonly requiresNewUser: FieldRef<"Voucher", 'Boolean'>
    readonly isActive: FieldRef<"Voucher", 'Boolean'>
    readonly usedCount: FieldRef<"Voucher", 'Int'>
    readonly createdAt: FieldRef<"Voucher", 'DateTime'>
    readonly updatedAt: FieldRef<"Voucher", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Voucher findUnique
   */
  export type VoucherFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter, which Voucher to fetch.
     */
    where: VoucherWhereUniqueInput
  }

  /**
   * Voucher findUniqueOrThrow
   */
  export type VoucherFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter, which Voucher to fetch.
     */
    where: VoucherWhereUniqueInput
  }

  /**
   * Voucher findFirst
   */
  export type VoucherFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter, which Voucher to fetch.
     */
    where?: VoucherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VoucherOrderByWithRelationInput | VoucherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vouchers.
     */
    cursor?: VoucherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vouchers.
     */
    distinct?: VoucherScalarFieldEnum | VoucherScalarFieldEnum[]
  }

  /**
   * Voucher findFirstOrThrow
   */
  export type VoucherFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter, which Voucher to fetch.
     */
    where?: VoucherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VoucherOrderByWithRelationInput | VoucherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Vouchers.
     */
    cursor?: VoucherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Vouchers.
     */
    distinct?: VoucherScalarFieldEnum | VoucherScalarFieldEnum[]
  }

  /**
   * Voucher findMany
   */
  export type VoucherFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter, which Vouchers to fetch.
     */
    where?: VoucherWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Vouchers to fetch.
     */
    orderBy?: VoucherOrderByWithRelationInput | VoucherOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Vouchers.
     */
    cursor?: VoucherWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Vouchers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Vouchers.
     */
    skip?: number
    distinct?: VoucherScalarFieldEnum | VoucherScalarFieldEnum[]
  }

  /**
   * Voucher create
   */
  export type VoucherCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * The data needed to create a Voucher.
     */
    data: XOR<VoucherCreateInput, VoucherUncheckedCreateInput>
  }

  /**
   * Voucher createMany
   */
  export type VoucherCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Vouchers.
     */
    data: VoucherCreateManyInput | VoucherCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Voucher createManyAndReturn
   */
  export type VoucherCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * The data used to create many Vouchers.
     */
    data: VoucherCreateManyInput | VoucherCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Voucher update
   */
  export type VoucherUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * The data needed to update a Voucher.
     */
    data: XOR<VoucherUpdateInput, VoucherUncheckedUpdateInput>
    /**
     * Choose, which Voucher to update.
     */
    where: VoucherWhereUniqueInput
  }

  /**
   * Voucher updateMany
   */
  export type VoucherUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Vouchers.
     */
    data: XOR<VoucherUpdateManyMutationInput, VoucherUncheckedUpdateManyInput>
    /**
     * Filter which Vouchers to update
     */
    where?: VoucherWhereInput
    /**
     * Limit how many Vouchers to update.
     */
    limit?: number
  }

  /**
   * Voucher updateManyAndReturn
   */
  export type VoucherUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * The data used to update Vouchers.
     */
    data: XOR<VoucherUpdateManyMutationInput, VoucherUncheckedUpdateManyInput>
    /**
     * Filter which Vouchers to update
     */
    where?: VoucherWhereInput
    /**
     * Limit how many Vouchers to update.
     */
    limit?: number
  }

  /**
   * Voucher upsert
   */
  export type VoucherUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * The filter to search for the Voucher to update in case it exists.
     */
    where: VoucherWhereUniqueInput
    /**
     * In case the Voucher found by the `where` argument doesn't exist, create a new Voucher with this data.
     */
    create: XOR<VoucherCreateInput, VoucherUncheckedCreateInput>
    /**
     * In case the Voucher was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VoucherUpdateInput, VoucherUncheckedUpdateInput>
  }

  /**
   * Voucher delete
   */
  export type VoucherDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
    /**
     * Filter which Voucher to delete.
     */
    where: VoucherWhereUniqueInput
  }

  /**
   * Voucher deleteMany
   */
  export type VoucherDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Vouchers to delete
     */
    where?: VoucherWhereInput
    /**
     * Limit how many Vouchers to delete.
     */
    limit?: number
  }

  /**
   * Voucher.bookings
   */
  export type Voucher$bookingsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Booking
     */
    select?: BookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Booking
     */
    omit?: BookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BookingInclude<ExtArgs> | null
    where?: BookingWhereInput
    orderBy?: BookingOrderByWithRelationInput | BookingOrderByWithRelationInput[]
    cursor?: BookingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BookingScalarFieldEnum | BookingScalarFieldEnum[]
  }

  /**
   * Voucher.usages
   */
  export type Voucher$usagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    where?: VoucherUsageWhereInput
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    cursor?: VoucherUsageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: VoucherUsageScalarFieldEnum | VoucherUsageScalarFieldEnum[]
  }

  /**
   * Voucher without action
   */
  export type VoucherDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Voucher
     */
    select?: VoucherSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Voucher
     */
    omit?: VoucherOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherInclude<ExtArgs> | null
  }


  /**
   * Model VoucherUsage
   */

  export type AggregateVoucherUsage = {
    _count: VoucherUsageCountAggregateOutputType | null
    _avg: VoucherUsageAvgAggregateOutputType | null
    _sum: VoucherUsageSumAggregateOutputType | null
    _min: VoucherUsageMinAggregateOutputType | null
    _max: VoucherUsageMaxAggregateOutputType | null
  }

  export type VoucherUsageAvgAggregateOutputType = {
    discountAmount: number | null
  }

  export type VoucherUsageSumAggregateOutputType = {
    discountAmount: number | null
  }

  export type VoucherUsageMinAggregateOutputType = {
    id: string | null
    voucherId: string | null
    bookingId: string | null
    userId: string | null
    guestEmail: string | null
    discountAmount: number | null
    createdAt: Date | null
  }

  export type VoucherUsageMaxAggregateOutputType = {
    id: string | null
    voucherId: string | null
    bookingId: string | null
    userId: string | null
    guestEmail: string | null
    discountAmount: number | null
    createdAt: Date | null
  }

  export type VoucherUsageCountAggregateOutputType = {
    id: number
    voucherId: number
    bookingId: number
    userId: number
    guestEmail: number
    discountAmount: number
    createdAt: number
    _all: number
  }


  export type VoucherUsageAvgAggregateInputType = {
    discountAmount?: true
  }

  export type VoucherUsageSumAggregateInputType = {
    discountAmount?: true
  }

  export type VoucherUsageMinAggregateInputType = {
    id?: true
    voucherId?: true
    bookingId?: true
    userId?: true
    guestEmail?: true
    discountAmount?: true
    createdAt?: true
  }

  export type VoucherUsageMaxAggregateInputType = {
    id?: true
    voucherId?: true
    bookingId?: true
    userId?: true
    guestEmail?: true
    discountAmount?: true
    createdAt?: true
  }

  export type VoucherUsageCountAggregateInputType = {
    id?: true
    voucherId?: true
    bookingId?: true
    userId?: true
    guestEmail?: true
    discountAmount?: true
    createdAt?: true
    _all?: true
  }

  export type VoucherUsageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VoucherUsage to aggregate.
     */
    where?: VoucherUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoucherUsages to fetch.
     */
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: VoucherUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoucherUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoucherUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned VoucherUsages
    **/
    _count?: true | VoucherUsageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: VoucherUsageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: VoucherUsageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: VoucherUsageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: VoucherUsageMaxAggregateInputType
  }

  export type GetVoucherUsageAggregateType<T extends VoucherUsageAggregateArgs> = {
        [P in keyof T & keyof AggregateVoucherUsage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateVoucherUsage[P]>
      : GetScalarType<T[P], AggregateVoucherUsage[P]>
  }




  export type VoucherUsageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: VoucherUsageWhereInput
    orderBy?: VoucherUsageOrderByWithAggregationInput | VoucherUsageOrderByWithAggregationInput[]
    by: VoucherUsageScalarFieldEnum[] | VoucherUsageScalarFieldEnum
    having?: VoucherUsageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: VoucherUsageCountAggregateInputType | true
    _avg?: VoucherUsageAvgAggregateInputType
    _sum?: VoucherUsageSumAggregateInputType
    _min?: VoucherUsageMinAggregateInputType
    _max?: VoucherUsageMaxAggregateInputType
  }

  export type VoucherUsageGroupByOutputType = {
    id: string
    voucherId: string
    bookingId: string
    userId: string | null
    guestEmail: string | null
    discountAmount: number
    createdAt: Date
    _count: VoucherUsageCountAggregateOutputType | null
    _avg: VoucherUsageAvgAggregateOutputType | null
    _sum: VoucherUsageSumAggregateOutputType | null
    _min: VoucherUsageMinAggregateOutputType | null
    _max: VoucherUsageMaxAggregateOutputType | null
  }

  type GetVoucherUsageGroupByPayload<T extends VoucherUsageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<VoucherUsageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof VoucherUsageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], VoucherUsageGroupByOutputType[P]>
            : GetScalarType<T[P], VoucherUsageGroupByOutputType[P]>
        }
      >
    >


  export type VoucherUsageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    voucherId?: boolean
    bookingId?: boolean
    userId?: boolean
    guestEmail?: boolean
    discountAmount?: boolean
    createdAt?: boolean
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["voucherUsage"]>

  export type VoucherUsageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    voucherId?: boolean
    bookingId?: boolean
    userId?: boolean
    guestEmail?: boolean
    discountAmount?: boolean
    createdAt?: boolean
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["voucherUsage"]>

  export type VoucherUsageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    voucherId?: boolean
    bookingId?: boolean
    userId?: boolean
    guestEmail?: boolean
    discountAmount?: boolean
    createdAt?: boolean
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["voucherUsage"]>

  export type VoucherUsageSelectScalar = {
    id?: boolean
    voucherId?: boolean
    bookingId?: boolean
    userId?: boolean
    guestEmail?: boolean
    discountAmount?: boolean
    createdAt?: boolean
  }

  export type VoucherUsageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "voucherId" | "bookingId" | "userId" | "guestEmail" | "discountAmount" | "createdAt", ExtArgs["result"]["voucherUsage"]>
  export type VoucherUsageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type VoucherUsageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type VoucherUsageIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    voucher?: boolean | VoucherDefaultArgs<ExtArgs>
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }

  export type $VoucherUsagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "VoucherUsage"
    objects: {
      voucher: Prisma.$VoucherPayload<ExtArgs>
      booking: Prisma.$BookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      voucherId: string
      bookingId: string
      userId: string | null
      guestEmail: string | null
      discountAmount: number
      createdAt: Date
    }, ExtArgs["result"]["voucherUsage"]>
    composites: {}
  }

  type VoucherUsageGetPayload<S extends boolean | null | undefined | VoucherUsageDefaultArgs> = $Result.GetResult<Prisma.$VoucherUsagePayload, S>

  type VoucherUsageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<VoucherUsageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: VoucherUsageCountAggregateInputType | true
    }

  export interface VoucherUsageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['VoucherUsage'], meta: { name: 'VoucherUsage' } }
    /**
     * Find zero or one VoucherUsage that matches the filter.
     * @param {VoucherUsageFindUniqueArgs} args - Arguments to find a VoucherUsage
     * @example
     * // Get one VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends VoucherUsageFindUniqueArgs>(args: SelectSubset<T, VoucherUsageFindUniqueArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one VoucherUsage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {VoucherUsageFindUniqueOrThrowArgs} args - Arguments to find a VoucherUsage
     * @example
     * // Get one VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends VoucherUsageFindUniqueOrThrowArgs>(args: SelectSubset<T, VoucherUsageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VoucherUsage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageFindFirstArgs} args - Arguments to find a VoucherUsage
     * @example
     * // Get one VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends VoucherUsageFindFirstArgs>(args?: SelectSubset<T, VoucherUsageFindFirstArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first VoucherUsage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageFindFirstOrThrowArgs} args - Arguments to find a VoucherUsage
     * @example
     * // Get one VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends VoucherUsageFindFirstOrThrowArgs>(args?: SelectSubset<T, VoucherUsageFindFirstOrThrowArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more VoucherUsages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all VoucherUsages
     * const voucherUsages = await prisma.voucherUsage.findMany()
     * 
     * // Get first 10 VoucherUsages
     * const voucherUsages = await prisma.voucherUsage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const voucherUsageWithIdOnly = await prisma.voucherUsage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends VoucherUsageFindManyArgs>(args?: SelectSubset<T, VoucherUsageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a VoucherUsage.
     * @param {VoucherUsageCreateArgs} args - Arguments to create a VoucherUsage.
     * @example
     * // Create one VoucherUsage
     * const VoucherUsage = await prisma.voucherUsage.create({
     *   data: {
     *     // ... data to create a VoucherUsage
     *   }
     * })
     * 
     */
    create<T extends VoucherUsageCreateArgs>(args: SelectSubset<T, VoucherUsageCreateArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many VoucherUsages.
     * @param {VoucherUsageCreateManyArgs} args - Arguments to create many VoucherUsages.
     * @example
     * // Create many VoucherUsages
     * const voucherUsage = await prisma.voucherUsage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends VoucherUsageCreateManyArgs>(args?: SelectSubset<T, VoucherUsageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many VoucherUsages and returns the data saved in the database.
     * @param {VoucherUsageCreateManyAndReturnArgs} args - Arguments to create many VoucherUsages.
     * @example
     * // Create many VoucherUsages
     * const voucherUsage = await prisma.voucherUsage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many VoucherUsages and only return the `id`
     * const voucherUsageWithIdOnly = await prisma.voucherUsage.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends VoucherUsageCreateManyAndReturnArgs>(args?: SelectSubset<T, VoucherUsageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a VoucherUsage.
     * @param {VoucherUsageDeleteArgs} args - Arguments to delete one VoucherUsage.
     * @example
     * // Delete one VoucherUsage
     * const VoucherUsage = await prisma.voucherUsage.delete({
     *   where: {
     *     // ... filter to delete one VoucherUsage
     *   }
     * })
     * 
     */
    delete<T extends VoucherUsageDeleteArgs>(args: SelectSubset<T, VoucherUsageDeleteArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one VoucherUsage.
     * @param {VoucherUsageUpdateArgs} args - Arguments to update one VoucherUsage.
     * @example
     * // Update one VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends VoucherUsageUpdateArgs>(args: SelectSubset<T, VoucherUsageUpdateArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more VoucherUsages.
     * @param {VoucherUsageDeleteManyArgs} args - Arguments to filter VoucherUsages to delete.
     * @example
     * // Delete a few VoucherUsages
     * const { count } = await prisma.voucherUsage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends VoucherUsageDeleteManyArgs>(args?: SelectSubset<T, VoucherUsageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VoucherUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many VoucherUsages
     * const voucherUsage = await prisma.voucherUsage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends VoucherUsageUpdateManyArgs>(args: SelectSubset<T, VoucherUsageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more VoucherUsages and returns the data updated in the database.
     * @param {VoucherUsageUpdateManyAndReturnArgs} args - Arguments to update many VoucherUsages.
     * @example
     * // Update many VoucherUsages
     * const voucherUsage = await prisma.voucherUsage.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more VoucherUsages and only return the `id`
     * const voucherUsageWithIdOnly = await prisma.voucherUsage.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends VoucherUsageUpdateManyAndReturnArgs>(args: SelectSubset<T, VoucherUsageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one VoucherUsage.
     * @param {VoucherUsageUpsertArgs} args - Arguments to update or create a VoucherUsage.
     * @example
     * // Update or create a VoucherUsage
     * const voucherUsage = await prisma.voucherUsage.upsert({
     *   create: {
     *     // ... data to create a VoucherUsage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the VoucherUsage we want to update
     *   }
     * })
     */
    upsert<T extends VoucherUsageUpsertArgs>(args: SelectSubset<T, VoucherUsageUpsertArgs<ExtArgs>>): Prisma__VoucherUsageClient<$Result.GetResult<Prisma.$VoucherUsagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of VoucherUsages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageCountArgs} args - Arguments to filter VoucherUsages to count.
     * @example
     * // Count the number of VoucherUsages
     * const count = await prisma.voucherUsage.count({
     *   where: {
     *     // ... the filter for the VoucherUsages we want to count
     *   }
     * })
    **/
    count<T extends VoucherUsageCountArgs>(
      args?: Subset<T, VoucherUsageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], VoucherUsageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a VoucherUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends VoucherUsageAggregateArgs>(args: Subset<T, VoucherUsageAggregateArgs>): Prisma.PrismaPromise<GetVoucherUsageAggregateType<T>>

    /**
     * Group by VoucherUsage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {VoucherUsageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends VoucherUsageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: VoucherUsageGroupByArgs['orderBy'] }
        : { orderBy?: VoucherUsageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, VoucherUsageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetVoucherUsageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the VoucherUsage model
   */
  readonly fields: VoucherUsageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for VoucherUsage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__VoucherUsageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    voucher<T extends VoucherDefaultArgs<ExtArgs> = {}>(args?: Subset<T, VoucherDefaultArgs<ExtArgs>>): Prisma__VoucherClient<$Result.GetResult<Prisma.$VoucherPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    booking<T extends BookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BookingDefaultArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the VoucherUsage model
   */
  interface VoucherUsageFieldRefs {
    readonly id: FieldRef<"VoucherUsage", 'String'>
    readonly voucherId: FieldRef<"VoucherUsage", 'String'>
    readonly bookingId: FieldRef<"VoucherUsage", 'String'>
    readonly userId: FieldRef<"VoucherUsage", 'String'>
    readonly guestEmail: FieldRef<"VoucherUsage", 'String'>
    readonly discountAmount: FieldRef<"VoucherUsage", 'Float'>
    readonly createdAt: FieldRef<"VoucherUsage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * VoucherUsage findUnique
   */
  export type VoucherUsageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter, which VoucherUsage to fetch.
     */
    where: VoucherUsageWhereUniqueInput
  }

  /**
   * VoucherUsage findUniqueOrThrow
   */
  export type VoucherUsageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter, which VoucherUsage to fetch.
     */
    where: VoucherUsageWhereUniqueInput
  }

  /**
   * VoucherUsage findFirst
   */
  export type VoucherUsageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter, which VoucherUsage to fetch.
     */
    where?: VoucherUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoucherUsages to fetch.
     */
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VoucherUsages.
     */
    cursor?: VoucherUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoucherUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoucherUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VoucherUsages.
     */
    distinct?: VoucherUsageScalarFieldEnum | VoucherUsageScalarFieldEnum[]
  }

  /**
   * VoucherUsage findFirstOrThrow
   */
  export type VoucherUsageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter, which VoucherUsage to fetch.
     */
    where?: VoucherUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoucherUsages to fetch.
     */
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for VoucherUsages.
     */
    cursor?: VoucherUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoucherUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoucherUsages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of VoucherUsages.
     */
    distinct?: VoucherUsageScalarFieldEnum | VoucherUsageScalarFieldEnum[]
  }

  /**
   * VoucherUsage findMany
   */
  export type VoucherUsageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter, which VoucherUsages to fetch.
     */
    where?: VoucherUsageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of VoucherUsages to fetch.
     */
    orderBy?: VoucherUsageOrderByWithRelationInput | VoucherUsageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing VoucherUsages.
     */
    cursor?: VoucherUsageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` VoucherUsages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` VoucherUsages.
     */
    skip?: number
    distinct?: VoucherUsageScalarFieldEnum | VoucherUsageScalarFieldEnum[]
  }

  /**
   * VoucherUsage create
   */
  export type VoucherUsageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * The data needed to create a VoucherUsage.
     */
    data: XOR<VoucherUsageCreateInput, VoucherUsageUncheckedCreateInput>
  }

  /**
   * VoucherUsage createMany
   */
  export type VoucherUsageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many VoucherUsages.
     */
    data: VoucherUsageCreateManyInput | VoucherUsageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * VoucherUsage createManyAndReturn
   */
  export type VoucherUsageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * The data used to create many VoucherUsages.
     */
    data: VoucherUsageCreateManyInput | VoucherUsageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * VoucherUsage update
   */
  export type VoucherUsageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * The data needed to update a VoucherUsage.
     */
    data: XOR<VoucherUsageUpdateInput, VoucherUsageUncheckedUpdateInput>
    /**
     * Choose, which VoucherUsage to update.
     */
    where: VoucherUsageWhereUniqueInput
  }

  /**
   * VoucherUsage updateMany
   */
  export type VoucherUsageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update VoucherUsages.
     */
    data: XOR<VoucherUsageUpdateManyMutationInput, VoucherUsageUncheckedUpdateManyInput>
    /**
     * Filter which VoucherUsages to update
     */
    where?: VoucherUsageWhereInput
    /**
     * Limit how many VoucherUsages to update.
     */
    limit?: number
  }

  /**
   * VoucherUsage updateManyAndReturn
   */
  export type VoucherUsageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * The data used to update VoucherUsages.
     */
    data: XOR<VoucherUsageUpdateManyMutationInput, VoucherUsageUncheckedUpdateManyInput>
    /**
     * Filter which VoucherUsages to update
     */
    where?: VoucherUsageWhereInput
    /**
     * Limit how many VoucherUsages to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * VoucherUsage upsert
   */
  export type VoucherUsageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * The filter to search for the VoucherUsage to update in case it exists.
     */
    where: VoucherUsageWhereUniqueInput
    /**
     * In case the VoucherUsage found by the `where` argument doesn't exist, create a new VoucherUsage with this data.
     */
    create: XOR<VoucherUsageCreateInput, VoucherUsageUncheckedCreateInput>
    /**
     * In case the VoucherUsage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<VoucherUsageUpdateInput, VoucherUsageUncheckedUpdateInput>
  }

  /**
   * VoucherUsage delete
   */
  export type VoucherUsageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
    /**
     * Filter which VoucherUsage to delete.
     */
    where: VoucherUsageWhereUniqueInput
  }

  /**
   * VoucherUsage deleteMany
   */
  export type VoucherUsageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which VoucherUsages to delete
     */
    where?: VoucherUsageWhereInput
    /**
     * Limit how many VoucherUsages to delete.
     */
    limit?: number
  }

  /**
   * VoucherUsage without action
   */
  export type VoucherUsageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the VoucherUsage
     */
    select?: VoucherUsageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the VoucherUsage
     */
    omit?: VoucherUsageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: VoucherUsageInclude<ExtArgs> | null
  }


  /**
   * Model Passenger
   */

  export type AggregatePassenger = {
    _count: PassengerCountAggregateOutputType | null
    _min: PassengerMinAggregateOutputType | null
    _max: PassengerMaxAggregateOutputType | null
  }

  export type PassengerMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    fullName: string | null
    phone: string | null
    email: string | null
    idNumber: string | null
    seatId: string | null
  }

  export type PassengerMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    fullName: string | null
    phone: string | null
    email: string | null
    idNumber: string | null
    seatId: string | null
  }

  export type PassengerCountAggregateOutputType = {
    id: number
    bookingId: number
    fullName: number
    phone: number
    email: number
    idNumber: number
    seatId: number
    _all: number
  }


  export type PassengerMinAggregateInputType = {
    id?: true
    bookingId?: true
    fullName?: true
    phone?: true
    email?: true
    idNumber?: true
    seatId?: true
  }

  export type PassengerMaxAggregateInputType = {
    id?: true
    bookingId?: true
    fullName?: true
    phone?: true
    email?: true
    idNumber?: true
    seatId?: true
  }

  export type PassengerCountAggregateInputType = {
    id?: true
    bookingId?: true
    fullName?: true
    phone?: true
    email?: true
    idNumber?: true
    seatId?: true
    _all?: true
  }

  export type PassengerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Passenger to aggregate.
     */
    where?: PassengerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passengers to fetch.
     */
    orderBy?: PassengerOrderByWithRelationInput | PassengerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PassengerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passengers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Passengers
    **/
    _count?: true | PassengerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PassengerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PassengerMaxAggregateInputType
  }

  export type GetPassengerAggregateType<T extends PassengerAggregateArgs> = {
        [P in keyof T & keyof AggregatePassenger]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePassenger[P]>
      : GetScalarType<T[P], AggregatePassenger[P]>
  }




  export type PassengerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PassengerWhereInput
    orderBy?: PassengerOrderByWithAggregationInput | PassengerOrderByWithAggregationInput[]
    by: PassengerScalarFieldEnum[] | PassengerScalarFieldEnum
    having?: PassengerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PassengerCountAggregateInputType | true
    _min?: PassengerMinAggregateInputType
    _max?: PassengerMaxAggregateInputType
  }

  export type PassengerGroupByOutputType = {
    id: string
    bookingId: string
    fullName: string
    phone: string
    email: string
    idNumber: string | null
    seatId: string
    _count: PassengerCountAggregateOutputType | null
    _min: PassengerMinAggregateOutputType | null
    _max: PassengerMaxAggregateOutputType | null
  }

  type GetPassengerGroupByPayload<T extends PassengerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PassengerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PassengerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PassengerGroupByOutputType[P]>
            : GetScalarType<T[P], PassengerGroupByOutputType[P]>
        }
      >
    >


  export type PassengerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    idNumber?: boolean
    seatId?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passenger"]>

  export type PassengerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    idNumber?: boolean
    seatId?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passenger"]>

  export type PassengerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    idNumber?: boolean
    seatId?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["passenger"]>

  export type PassengerSelectScalar = {
    id?: boolean
    bookingId?: boolean
    fullName?: boolean
    phone?: boolean
    email?: boolean
    idNumber?: boolean
    seatId?: boolean
  }

  export type PassengerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "fullName" | "phone" | "email" | "idNumber" | "seatId", ExtArgs["result"]["passenger"]>
  export type PassengerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type PassengerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type PassengerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }

  export type $PassengerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Passenger"
    objects: {
      booking: Prisma.$BookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      fullName: string
      phone: string
      email: string
      idNumber: string | null
      seatId: string
    }, ExtArgs["result"]["passenger"]>
    composites: {}
  }

  type PassengerGetPayload<S extends boolean | null | undefined | PassengerDefaultArgs> = $Result.GetResult<Prisma.$PassengerPayload, S>

  type PassengerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PassengerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PassengerCountAggregateInputType | true
    }

  export interface PassengerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Passenger'], meta: { name: 'Passenger' } }
    /**
     * Find zero or one Passenger that matches the filter.
     * @param {PassengerFindUniqueArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PassengerFindUniqueArgs>(args: SelectSubset<T, PassengerFindUniqueArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Passenger that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PassengerFindUniqueOrThrowArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PassengerFindUniqueOrThrowArgs>(args: SelectSubset<T, PassengerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Passenger that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindFirstArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PassengerFindFirstArgs>(args?: SelectSubset<T, PassengerFindFirstArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Passenger that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindFirstOrThrowArgs} args - Arguments to find a Passenger
     * @example
     * // Get one Passenger
     * const passenger = await prisma.passenger.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PassengerFindFirstOrThrowArgs>(args?: SelectSubset<T, PassengerFindFirstOrThrowArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Passengers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Passengers
     * const passengers = await prisma.passenger.findMany()
     * 
     * // Get first 10 Passengers
     * const passengers = await prisma.passenger.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const passengerWithIdOnly = await prisma.passenger.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PassengerFindManyArgs>(args?: SelectSubset<T, PassengerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Passenger.
     * @param {PassengerCreateArgs} args - Arguments to create a Passenger.
     * @example
     * // Create one Passenger
     * const Passenger = await prisma.passenger.create({
     *   data: {
     *     // ... data to create a Passenger
     *   }
     * })
     * 
     */
    create<T extends PassengerCreateArgs>(args: SelectSubset<T, PassengerCreateArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Passengers.
     * @param {PassengerCreateManyArgs} args - Arguments to create many Passengers.
     * @example
     * // Create many Passengers
     * const passenger = await prisma.passenger.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PassengerCreateManyArgs>(args?: SelectSubset<T, PassengerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Passengers and returns the data saved in the database.
     * @param {PassengerCreateManyAndReturnArgs} args - Arguments to create many Passengers.
     * @example
     * // Create many Passengers
     * const passenger = await prisma.passenger.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Passengers and only return the `id`
     * const passengerWithIdOnly = await prisma.passenger.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PassengerCreateManyAndReturnArgs>(args?: SelectSubset<T, PassengerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Passenger.
     * @param {PassengerDeleteArgs} args - Arguments to delete one Passenger.
     * @example
     * // Delete one Passenger
     * const Passenger = await prisma.passenger.delete({
     *   where: {
     *     // ... filter to delete one Passenger
     *   }
     * })
     * 
     */
    delete<T extends PassengerDeleteArgs>(args: SelectSubset<T, PassengerDeleteArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Passenger.
     * @param {PassengerUpdateArgs} args - Arguments to update one Passenger.
     * @example
     * // Update one Passenger
     * const passenger = await prisma.passenger.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PassengerUpdateArgs>(args: SelectSubset<T, PassengerUpdateArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Passengers.
     * @param {PassengerDeleteManyArgs} args - Arguments to filter Passengers to delete.
     * @example
     * // Delete a few Passengers
     * const { count } = await prisma.passenger.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PassengerDeleteManyArgs>(args?: SelectSubset<T, PassengerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Passengers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Passengers
     * const passenger = await prisma.passenger.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PassengerUpdateManyArgs>(args: SelectSubset<T, PassengerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Passengers and returns the data updated in the database.
     * @param {PassengerUpdateManyAndReturnArgs} args - Arguments to update many Passengers.
     * @example
     * // Update many Passengers
     * const passenger = await prisma.passenger.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Passengers and only return the `id`
     * const passengerWithIdOnly = await prisma.passenger.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PassengerUpdateManyAndReturnArgs>(args: SelectSubset<T, PassengerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Passenger.
     * @param {PassengerUpsertArgs} args - Arguments to update or create a Passenger.
     * @example
     * // Update or create a Passenger
     * const passenger = await prisma.passenger.upsert({
     *   create: {
     *     // ... data to create a Passenger
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Passenger we want to update
     *   }
     * })
     */
    upsert<T extends PassengerUpsertArgs>(args: SelectSubset<T, PassengerUpsertArgs<ExtArgs>>): Prisma__PassengerClient<$Result.GetResult<Prisma.$PassengerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Passengers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerCountArgs} args - Arguments to filter Passengers to count.
     * @example
     * // Count the number of Passengers
     * const count = await prisma.passenger.count({
     *   where: {
     *     // ... the filter for the Passengers we want to count
     *   }
     * })
    **/
    count<T extends PassengerCountArgs>(
      args?: Subset<T, PassengerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PassengerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Passenger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PassengerAggregateArgs>(args: Subset<T, PassengerAggregateArgs>): Prisma.PrismaPromise<GetPassengerAggregateType<T>>

    /**
     * Group by Passenger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PassengerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PassengerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PassengerGroupByArgs['orderBy'] }
        : { orderBy?: PassengerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PassengerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPassengerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Passenger model
   */
  readonly fields: PassengerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Passenger.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PassengerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends BookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BookingDefaultArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Passenger model
   */
  interface PassengerFieldRefs {
    readonly id: FieldRef<"Passenger", 'String'>
    readonly bookingId: FieldRef<"Passenger", 'String'>
    readonly fullName: FieldRef<"Passenger", 'String'>
    readonly phone: FieldRef<"Passenger", 'String'>
    readonly email: FieldRef<"Passenger", 'String'>
    readonly idNumber: FieldRef<"Passenger", 'String'>
    readonly seatId: FieldRef<"Passenger", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Passenger findUnique
   */
  export type PassengerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter, which Passenger to fetch.
     */
    where: PassengerWhereUniqueInput
  }

  /**
   * Passenger findUniqueOrThrow
   */
  export type PassengerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter, which Passenger to fetch.
     */
    where: PassengerWhereUniqueInput
  }

  /**
   * Passenger findFirst
   */
  export type PassengerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter, which Passenger to fetch.
     */
    where?: PassengerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passengers to fetch.
     */
    orderBy?: PassengerOrderByWithRelationInput | PassengerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Passengers.
     */
    cursor?: PassengerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passengers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Passengers.
     */
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[]
  }

  /**
   * Passenger findFirstOrThrow
   */
  export type PassengerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter, which Passenger to fetch.
     */
    where?: PassengerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passengers to fetch.
     */
    orderBy?: PassengerOrderByWithRelationInput | PassengerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Passengers.
     */
    cursor?: PassengerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passengers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Passengers.
     */
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[]
  }

  /**
   * Passenger findMany
   */
  export type PassengerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter, which Passengers to fetch.
     */
    where?: PassengerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Passengers to fetch.
     */
    orderBy?: PassengerOrderByWithRelationInput | PassengerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Passengers.
     */
    cursor?: PassengerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Passengers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Passengers.
     */
    skip?: number
    distinct?: PassengerScalarFieldEnum | PassengerScalarFieldEnum[]
  }

  /**
   * Passenger create
   */
  export type PassengerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * The data needed to create a Passenger.
     */
    data: XOR<PassengerCreateInput, PassengerUncheckedCreateInput>
  }

  /**
   * Passenger createMany
   */
  export type PassengerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Passengers.
     */
    data: PassengerCreateManyInput | PassengerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Passenger createManyAndReturn
   */
  export type PassengerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * The data used to create many Passengers.
     */
    data: PassengerCreateManyInput | PassengerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Passenger update
   */
  export type PassengerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * The data needed to update a Passenger.
     */
    data: XOR<PassengerUpdateInput, PassengerUncheckedUpdateInput>
    /**
     * Choose, which Passenger to update.
     */
    where: PassengerWhereUniqueInput
  }

  /**
   * Passenger updateMany
   */
  export type PassengerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Passengers.
     */
    data: XOR<PassengerUpdateManyMutationInput, PassengerUncheckedUpdateManyInput>
    /**
     * Filter which Passengers to update
     */
    where?: PassengerWhereInput
    /**
     * Limit how many Passengers to update.
     */
    limit?: number
  }

  /**
   * Passenger updateManyAndReturn
   */
  export type PassengerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * The data used to update Passengers.
     */
    data: XOR<PassengerUpdateManyMutationInput, PassengerUncheckedUpdateManyInput>
    /**
     * Filter which Passengers to update
     */
    where?: PassengerWhereInput
    /**
     * Limit how many Passengers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Passenger upsert
   */
  export type PassengerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * The filter to search for the Passenger to update in case it exists.
     */
    where: PassengerWhereUniqueInput
    /**
     * In case the Passenger found by the `where` argument doesn't exist, create a new Passenger with this data.
     */
    create: XOR<PassengerCreateInput, PassengerUncheckedCreateInput>
    /**
     * In case the Passenger was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PassengerUpdateInput, PassengerUncheckedUpdateInput>
  }

  /**
   * Passenger delete
   */
  export type PassengerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
    /**
     * Filter which Passenger to delete.
     */
    where: PassengerWhereUniqueInput
  }

  /**
   * Passenger deleteMany
   */
  export type PassengerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Passengers to delete
     */
    where?: PassengerWhereInput
    /**
     * Limit how many Passengers to delete.
     */
    limit?: number
  }

  /**
   * Passenger without action
   */
  export type PassengerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Passenger
     */
    select?: PassengerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Passenger
     */
    omit?: PassengerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PassengerInclude<ExtArgs> | null
  }


  /**
   * Model StatusLog
   */

  export type AggregateStatusLog = {
    _count: StatusLogCountAggregateOutputType | null
    _min: StatusLogMinAggregateOutputType | null
    _max: StatusLogMaxAggregateOutputType | null
  }

  export type StatusLogMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    fromStatus: string | null
    toStatus: string | null
    createdAt: Date | null
  }

  export type StatusLogMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    fromStatus: string | null
    toStatus: string | null
    createdAt: Date | null
  }

  export type StatusLogCountAggregateOutputType = {
    id: number
    bookingId: number
    fromStatus: number
    toStatus: number
    createdAt: number
    _all: number
  }


  export type StatusLogMinAggregateInputType = {
    id?: true
    bookingId?: true
    fromStatus?: true
    toStatus?: true
    createdAt?: true
  }

  export type StatusLogMaxAggregateInputType = {
    id?: true
    bookingId?: true
    fromStatus?: true
    toStatus?: true
    createdAt?: true
  }

  export type StatusLogCountAggregateInputType = {
    id?: true
    bookingId?: true
    fromStatus?: true
    toStatus?: true
    createdAt?: true
    _all?: true
  }

  export type StatusLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatusLog to aggregate.
     */
    where?: StatusLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusLogs to fetch.
     */
    orderBy?: StatusLogOrderByWithRelationInput | StatusLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StatusLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StatusLogs
    **/
    _count?: true | StatusLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StatusLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StatusLogMaxAggregateInputType
  }

  export type GetStatusLogAggregateType<T extends StatusLogAggregateArgs> = {
        [P in keyof T & keyof AggregateStatusLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStatusLog[P]>
      : GetScalarType<T[P], AggregateStatusLog[P]>
  }




  export type StatusLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StatusLogWhereInput
    orderBy?: StatusLogOrderByWithAggregationInput | StatusLogOrderByWithAggregationInput[]
    by: StatusLogScalarFieldEnum[] | StatusLogScalarFieldEnum
    having?: StatusLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StatusLogCountAggregateInputType | true
    _min?: StatusLogMinAggregateInputType
    _max?: StatusLogMaxAggregateInputType
  }

  export type StatusLogGroupByOutputType = {
    id: string
    bookingId: string
    fromStatus: string | null
    toStatus: string
    createdAt: Date
    _count: StatusLogCountAggregateOutputType | null
    _min: StatusLogMinAggregateOutputType | null
    _max: StatusLogMaxAggregateOutputType | null
  }

  type GetStatusLogGroupByPayload<T extends StatusLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StatusLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StatusLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StatusLogGroupByOutputType[P]>
            : GetScalarType<T[P], StatusLogGroupByOutputType[P]>
        }
      >
    >


  export type StatusLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    createdAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusLog"]>

  export type StatusLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    createdAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusLog"]>

  export type StatusLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    createdAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["statusLog"]>

  export type StatusLogSelectScalar = {
    id?: boolean
    bookingId?: boolean
    fromStatus?: boolean
    toStatus?: boolean
    createdAt?: boolean
  }

  export type StatusLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "fromStatus" | "toStatus" | "createdAt", ExtArgs["result"]["statusLog"]>
  export type StatusLogInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type StatusLogIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type StatusLogIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }

  export type $StatusLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StatusLog"
    objects: {
      booking: Prisma.$BookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      fromStatus: string | null
      toStatus: string
      createdAt: Date
    }, ExtArgs["result"]["statusLog"]>
    composites: {}
  }

  type StatusLogGetPayload<S extends boolean | null | undefined | StatusLogDefaultArgs> = $Result.GetResult<Prisma.$StatusLogPayload, S>

  type StatusLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StatusLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StatusLogCountAggregateInputType | true
    }

  export interface StatusLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StatusLog'], meta: { name: 'StatusLog' } }
    /**
     * Find zero or one StatusLog that matches the filter.
     * @param {StatusLogFindUniqueArgs} args - Arguments to find a StatusLog
     * @example
     * // Get one StatusLog
     * const statusLog = await prisma.statusLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StatusLogFindUniqueArgs>(args: SelectSubset<T, StatusLogFindUniqueArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StatusLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StatusLogFindUniqueOrThrowArgs} args - Arguments to find a StatusLog
     * @example
     * // Get one StatusLog
     * const statusLog = await prisma.statusLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StatusLogFindUniqueOrThrowArgs>(args: SelectSubset<T, StatusLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatusLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogFindFirstArgs} args - Arguments to find a StatusLog
     * @example
     * // Get one StatusLog
     * const statusLog = await prisma.statusLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StatusLogFindFirstArgs>(args?: SelectSubset<T, StatusLogFindFirstArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StatusLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogFindFirstOrThrowArgs} args - Arguments to find a StatusLog
     * @example
     * // Get one StatusLog
     * const statusLog = await prisma.statusLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StatusLogFindFirstOrThrowArgs>(args?: SelectSubset<T, StatusLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StatusLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StatusLogs
     * const statusLogs = await prisma.statusLog.findMany()
     * 
     * // Get first 10 StatusLogs
     * const statusLogs = await prisma.statusLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const statusLogWithIdOnly = await prisma.statusLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StatusLogFindManyArgs>(args?: SelectSubset<T, StatusLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StatusLog.
     * @param {StatusLogCreateArgs} args - Arguments to create a StatusLog.
     * @example
     * // Create one StatusLog
     * const StatusLog = await prisma.statusLog.create({
     *   data: {
     *     // ... data to create a StatusLog
     *   }
     * })
     * 
     */
    create<T extends StatusLogCreateArgs>(args: SelectSubset<T, StatusLogCreateArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StatusLogs.
     * @param {StatusLogCreateManyArgs} args - Arguments to create many StatusLogs.
     * @example
     * // Create many StatusLogs
     * const statusLog = await prisma.statusLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StatusLogCreateManyArgs>(args?: SelectSubset<T, StatusLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StatusLogs and returns the data saved in the database.
     * @param {StatusLogCreateManyAndReturnArgs} args - Arguments to create many StatusLogs.
     * @example
     * // Create many StatusLogs
     * const statusLog = await prisma.statusLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StatusLogs and only return the `id`
     * const statusLogWithIdOnly = await prisma.statusLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StatusLogCreateManyAndReturnArgs>(args?: SelectSubset<T, StatusLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StatusLog.
     * @param {StatusLogDeleteArgs} args - Arguments to delete one StatusLog.
     * @example
     * // Delete one StatusLog
     * const StatusLog = await prisma.statusLog.delete({
     *   where: {
     *     // ... filter to delete one StatusLog
     *   }
     * })
     * 
     */
    delete<T extends StatusLogDeleteArgs>(args: SelectSubset<T, StatusLogDeleteArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StatusLog.
     * @param {StatusLogUpdateArgs} args - Arguments to update one StatusLog.
     * @example
     * // Update one StatusLog
     * const statusLog = await prisma.statusLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StatusLogUpdateArgs>(args: SelectSubset<T, StatusLogUpdateArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StatusLogs.
     * @param {StatusLogDeleteManyArgs} args - Arguments to filter StatusLogs to delete.
     * @example
     * // Delete a few StatusLogs
     * const { count } = await prisma.statusLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StatusLogDeleteManyArgs>(args?: SelectSubset<T, StatusLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StatusLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StatusLogs
     * const statusLog = await prisma.statusLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StatusLogUpdateManyArgs>(args: SelectSubset<T, StatusLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StatusLogs and returns the data updated in the database.
     * @param {StatusLogUpdateManyAndReturnArgs} args - Arguments to update many StatusLogs.
     * @example
     * // Update many StatusLogs
     * const statusLog = await prisma.statusLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StatusLogs and only return the `id`
     * const statusLogWithIdOnly = await prisma.statusLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StatusLogUpdateManyAndReturnArgs>(args: SelectSubset<T, StatusLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StatusLog.
     * @param {StatusLogUpsertArgs} args - Arguments to update or create a StatusLog.
     * @example
     * // Update or create a StatusLog
     * const statusLog = await prisma.statusLog.upsert({
     *   create: {
     *     // ... data to create a StatusLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StatusLog we want to update
     *   }
     * })
     */
    upsert<T extends StatusLogUpsertArgs>(args: SelectSubset<T, StatusLogUpsertArgs<ExtArgs>>): Prisma__StatusLogClient<$Result.GetResult<Prisma.$StatusLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StatusLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogCountArgs} args - Arguments to filter StatusLogs to count.
     * @example
     * // Count the number of StatusLogs
     * const count = await prisma.statusLog.count({
     *   where: {
     *     // ... the filter for the StatusLogs we want to count
     *   }
     * })
    **/
    count<T extends StatusLogCountArgs>(
      args?: Subset<T, StatusLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StatusLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StatusLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StatusLogAggregateArgs>(args: Subset<T, StatusLogAggregateArgs>): Prisma.PrismaPromise<GetStatusLogAggregateType<T>>

    /**
     * Group by StatusLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StatusLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StatusLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StatusLogGroupByArgs['orderBy'] }
        : { orderBy?: StatusLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StatusLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStatusLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StatusLog model
   */
  readonly fields: StatusLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StatusLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StatusLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends BookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BookingDefaultArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StatusLog model
   */
  interface StatusLogFieldRefs {
    readonly id: FieldRef<"StatusLog", 'String'>
    readonly bookingId: FieldRef<"StatusLog", 'String'>
    readonly fromStatus: FieldRef<"StatusLog", 'String'>
    readonly toStatus: FieldRef<"StatusLog", 'String'>
    readonly createdAt: FieldRef<"StatusLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StatusLog findUnique
   */
  export type StatusLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter, which StatusLog to fetch.
     */
    where: StatusLogWhereUniqueInput
  }

  /**
   * StatusLog findUniqueOrThrow
   */
  export type StatusLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter, which StatusLog to fetch.
     */
    where: StatusLogWhereUniqueInput
  }

  /**
   * StatusLog findFirst
   */
  export type StatusLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter, which StatusLog to fetch.
     */
    where?: StatusLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusLogs to fetch.
     */
    orderBy?: StatusLogOrderByWithRelationInput | StatusLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatusLogs.
     */
    cursor?: StatusLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatusLogs.
     */
    distinct?: StatusLogScalarFieldEnum | StatusLogScalarFieldEnum[]
  }

  /**
   * StatusLog findFirstOrThrow
   */
  export type StatusLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter, which StatusLog to fetch.
     */
    where?: StatusLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusLogs to fetch.
     */
    orderBy?: StatusLogOrderByWithRelationInput | StatusLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StatusLogs.
     */
    cursor?: StatusLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StatusLogs.
     */
    distinct?: StatusLogScalarFieldEnum | StatusLogScalarFieldEnum[]
  }

  /**
   * StatusLog findMany
   */
  export type StatusLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter, which StatusLogs to fetch.
     */
    where?: StatusLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StatusLogs to fetch.
     */
    orderBy?: StatusLogOrderByWithRelationInput | StatusLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StatusLogs.
     */
    cursor?: StatusLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StatusLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StatusLogs.
     */
    skip?: number
    distinct?: StatusLogScalarFieldEnum | StatusLogScalarFieldEnum[]
  }

  /**
   * StatusLog create
   */
  export type StatusLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * The data needed to create a StatusLog.
     */
    data: XOR<StatusLogCreateInput, StatusLogUncheckedCreateInput>
  }

  /**
   * StatusLog createMany
   */
  export type StatusLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StatusLogs.
     */
    data: StatusLogCreateManyInput | StatusLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StatusLog createManyAndReturn
   */
  export type StatusLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * The data used to create many StatusLogs.
     */
    data: StatusLogCreateManyInput | StatusLogCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * StatusLog update
   */
  export type StatusLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * The data needed to update a StatusLog.
     */
    data: XOR<StatusLogUpdateInput, StatusLogUncheckedUpdateInput>
    /**
     * Choose, which StatusLog to update.
     */
    where: StatusLogWhereUniqueInput
  }

  /**
   * StatusLog updateMany
   */
  export type StatusLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StatusLogs.
     */
    data: XOR<StatusLogUpdateManyMutationInput, StatusLogUncheckedUpdateManyInput>
    /**
     * Filter which StatusLogs to update
     */
    where?: StatusLogWhereInput
    /**
     * Limit how many StatusLogs to update.
     */
    limit?: number
  }

  /**
   * StatusLog updateManyAndReturn
   */
  export type StatusLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * The data used to update StatusLogs.
     */
    data: XOR<StatusLogUpdateManyMutationInput, StatusLogUncheckedUpdateManyInput>
    /**
     * Filter which StatusLogs to update
     */
    where?: StatusLogWhereInput
    /**
     * Limit how many StatusLogs to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * StatusLog upsert
   */
  export type StatusLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * The filter to search for the StatusLog to update in case it exists.
     */
    where: StatusLogWhereUniqueInput
    /**
     * In case the StatusLog found by the `where` argument doesn't exist, create a new StatusLog with this data.
     */
    create: XOR<StatusLogCreateInput, StatusLogUncheckedCreateInput>
    /**
     * In case the StatusLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StatusLogUpdateInput, StatusLogUncheckedUpdateInput>
  }

  /**
   * StatusLog delete
   */
  export type StatusLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
    /**
     * Filter which StatusLog to delete.
     */
    where: StatusLogWhereUniqueInput
  }

  /**
   * StatusLog deleteMany
   */
  export type StatusLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StatusLogs to delete
     */
    where?: StatusLogWhereInput
    /**
     * Limit how many StatusLogs to delete.
     */
    limit?: number
  }

  /**
   * StatusLog without action
   */
  export type StatusLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StatusLog
     */
    select?: StatusLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StatusLog
     */
    omit?: StatusLogOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StatusLogInclude<ExtArgs> | null
  }


  /**
   * Model Review
   */

  export type AggregateReview = {
    _count: ReviewCountAggregateOutputType | null
    _avg: ReviewAvgAggregateOutputType | null
    _sum: ReviewSumAggregateOutputType | null
    _min: ReviewMinAggregateOutputType | null
    _max: ReviewMaxAggregateOutputType | null
  }

  export type ReviewAvgAggregateOutputType = {
    rating: number | null
  }

  export type ReviewSumAggregateOutputType = {
    rating: number | null
  }

  export type ReviewMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    userId: string | null
    tripId: string | null
    reviewerName: string | null
    routeName: string | null
    origin: string | null
    destination: string | null
    rating: number | null
    comment: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReviewMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    userId: string | null
    tripId: string | null
    reviewerName: string | null
    routeName: string | null
    origin: string | null
    destination: string | null
    rating: number | null
    comment: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReviewCountAggregateOutputType = {
    id: number
    bookingId: number
    userId: number
    tripId: number
    reviewerName: number
    routeName: number
    origin: number
    destination: number
    rating: number
    comment: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReviewAvgAggregateInputType = {
    rating?: true
  }

  export type ReviewSumAggregateInputType = {
    rating?: true
  }

  export type ReviewMinAggregateInputType = {
    id?: true
    bookingId?: true
    userId?: true
    tripId?: true
    reviewerName?: true
    routeName?: true
    origin?: true
    destination?: true
    rating?: true
    comment?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReviewMaxAggregateInputType = {
    id?: true
    bookingId?: true
    userId?: true
    tripId?: true
    reviewerName?: true
    routeName?: true
    origin?: true
    destination?: true
    rating?: true
    comment?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReviewCountAggregateInputType = {
    id?: true
    bookingId?: true
    userId?: true
    tripId?: true
    reviewerName?: true
    routeName?: true
    origin?: true
    destination?: true
    rating?: true
    comment?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReviewAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Review to aggregate.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Reviews
    **/
    _count?: true | ReviewCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReviewAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReviewSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReviewMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReviewMaxAggregateInputType
  }

  export type GetReviewAggregateType<T extends ReviewAggregateArgs> = {
        [P in keyof T & keyof AggregateReview]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReview[P]>
      : GetScalarType<T[P], AggregateReview[P]>
  }




  export type ReviewGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReviewWhereInput
    orderBy?: ReviewOrderByWithAggregationInput | ReviewOrderByWithAggregationInput[]
    by: ReviewScalarFieldEnum[] | ReviewScalarFieldEnum
    having?: ReviewScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReviewCountAggregateInputType | true
    _avg?: ReviewAvgAggregateInputType
    _sum?: ReviewSumAggregateInputType
    _min?: ReviewMinAggregateInputType
    _max?: ReviewMaxAggregateInputType
  }

  export type ReviewGroupByOutputType = {
    id: string
    bookingId: string
    userId: string
    tripId: string
    reviewerName: string
    routeName: string
    origin: string
    destination: string
    rating: number
    comment: string
    createdAt: Date
    updatedAt: Date
    _count: ReviewCountAggregateOutputType | null
    _avg: ReviewAvgAggregateOutputType | null
    _sum: ReviewSumAggregateOutputType | null
    _min: ReviewMinAggregateOutputType | null
    _max: ReviewMaxAggregateOutputType | null
  }

  type GetReviewGroupByPayload<T extends ReviewGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReviewGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReviewGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReviewGroupByOutputType[P]>
            : GetScalarType<T[P], ReviewGroupByOutputType[P]>
        }
      >
    >


  export type ReviewSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    userId?: boolean
    tripId?: boolean
    reviewerName?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["review"]>

  export type ReviewSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    userId?: boolean
    tripId?: boolean
    reviewerName?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["review"]>

  export type ReviewSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    userId?: boolean
    tripId?: boolean
    reviewerName?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["review"]>

  export type ReviewSelectScalar = {
    id?: boolean
    bookingId?: boolean
    userId?: boolean
    tripId?: boolean
    reviewerName?: boolean
    routeName?: boolean
    origin?: boolean
    destination?: boolean
    rating?: boolean
    comment?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReviewOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "userId" | "tripId" | "reviewerName" | "routeName" | "origin" | "destination" | "rating" | "comment" | "createdAt" | "updatedAt", ExtArgs["result"]["review"]>
  export type ReviewInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type ReviewIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }
  export type ReviewIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | BookingDefaultArgs<ExtArgs>
  }

  export type $ReviewPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Review"
    objects: {
      booking: Prisma.$BookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      userId: string
      tripId: string
      reviewerName: string
      routeName: string
      origin: string
      destination: string
      rating: number
      comment: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["review"]>
    composites: {}
  }

  type ReviewGetPayload<S extends boolean | null | undefined | ReviewDefaultArgs> = $Result.GetResult<Prisma.$ReviewPayload, S>

  type ReviewCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ReviewFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ReviewCountAggregateInputType | true
    }

  export interface ReviewDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Review'], meta: { name: 'Review' } }
    /**
     * Find zero or one Review that matches the filter.
     * @param {ReviewFindUniqueArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReviewFindUniqueArgs>(args: SelectSubset<T, ReviewFindUniqueArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Review that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ReviewFindUniqueOrThrowArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReviewFindUniqueOrThrowArgs>(args: SelectSubset<T, ReviewFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Review that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindFirstArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReviewFindFirstArgs>(args?: SelectSubset<T, ReviewFindFirstArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Review that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindFirstOrThrowArgs} args - Arguments to find a Review
     * @example
     * // Get one Review
     * const review = await prisma.review.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReviewFindFirstOrThrowArgs>(args?: SelectSubset<T, ReviewFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Reviews that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reviews
     * const reviews = await prisma.review.findMany()
     * 
     * // Get first 10 Reviews
     * const reviews = await prisma.review.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reviewWithIdOnly = await prisma.review.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReviewFindManyArgs>(args?: SelectSubset<T, ReviewFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Review.
     * @param {ReviewCreateArgs} args - Arguments to create a Review.
     * @example
     * // Create one Review
     * const Review = await prisma.review.create({
     *   data: {
     *     // ... data to create a Review
     *   }
     * })
     * 
     */
    create<T extends ReviewCreateArgs>(args: SelectSubset<T, ReviewCreateArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Reviews.
     * @param {ReviewCreateManyArgs} args - Arguments to create many Reviews.
     * @example
     * // Create many Reviews
     * const review = await prisma.review.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReviewCreateManyArgs>(args?: SelectSubset<T, ReviewCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reviews and returns the data saved in the database.
     * @param {ReviewCreateManyAndReturnArgs} args - Arguments to create many Reviews.
     * @example
     * // Create many Reviews
     * const review = await prisma.review.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reviews and only return the `id`
     * const reviewWithIdOnly = await prisma.review.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReviewCreateManyAndReturnArgs>(args?: SelectSubset<T, ReviewCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Review.
     * @param {ReviewDeleteArgs} args - Arguments to delete one Review.
     * @example
     * // Delete one Review
     * const Review = await prisma.review.delete({
     *   where: {
     *     // ... filter to delete one Review
     *   }
     * })
     * 
     */
    delete<T extends ReviewDeleteArgs>(args: SelectSubset<T, ReviewDeleteArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Review.
     * @param {ReviewUpdateArgs} args - Arguments to update one Review.
     * @example
     * // Update one Review
     * const review = await prisma.review.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReviewUpdateArgs>(args: SelectSubset<T, ReviewUpdateArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Reviews.
     * @param {ReviewDeleteManyArgs} args - Arguments to filter Reviews to delete.
     * @example
     * // Delete a few Reviews
     * const { count } = await prisma.review.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReviewDeleteManyArgs>(args?: SelectSubset<T, ReviewDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reviews
     * const review = await prisma.review.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReviewUpdateManyArgs>(args: SelectSubset<T, ReviewUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reviews and returns the data updated in the database.
     * @param {ReviewUpdateManyAndReturnArgs} args - Arguments to update many Reviews.
     * @example
     * // Update many Reviews
     * const review = await prisma.review.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Reviews and only return the `id`
     * const reviewWithIdOnly = await prisma.review.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ReviewUpdateManyAndReturnArgs>(args: SelectSubset<T, ReviewUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Review.
     * @param {ReviewUpsertArgs} args - Arguments to update or create a Review.
     * @example
     * // Update or create a Review
     * const review = await prisma.review.upsert({
     *   create: {
     *     // ... data to create a Review
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Review we want to update
     *   }
     * })
     */
    upsert<T extends ReviewUpsertArgs>(args: SelectSubset<T, ReviewUpsertArgs<ExtArgs>>): Prisma__ReviewClient<$Result.GetResult<Prisma.$ReviewPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Reviews.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewCountArgs} args - Arguments to filter Reviews to count.
     * @example
     * // Count the number of Reviews
     * const count = await prisma.review.count({
     *   where: {
     *     // ... the filter for the Reviews we want to count
     *   }
     * })
    **/
    count<T extends ReviewCountArgs>(
      args?: Subset<T, ReviewCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReviewCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Review.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReviewAggregateArgs>(args: Subset<T, ReviewAggregateArgs>): Prisma.PrismaPromise<GetReviewAggregateType<T>>

    /**
     * Group by Review.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReviewGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReviewGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReviewGroupByArgs['orderBy'] }
        : { orderBy?: ReviewGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReviewGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReviewGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Review model
   */
  readonly fields: ReviewFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Review.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReviewClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends BookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, BookingDefaultArgs<ExtArgs>>): Prisma__BookingClient<$Result.GetResult<Prisma.$BookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Review model
   */
  interface ReviewFieldRefs {
    readonly id: FieldRef<"Review", 'String'>
    readonly bookingId: FieldRef<"Review", 'String'>
    readonly userId: FieldRef<"Review", 'String'>
    readonly tripId: FieldRef<"Review", 'String'>
    readonly reviewerName: FieldRef<"Review", 'String'>
    readonly routeName: FieldRef<"Review", 'String'>
    readonly origin: FieldRef<"Review", 'String'>
    readonly destination: FieldRef<"Review", 'String'>
    readonly rating: FieldRef<"Review", 'Int'>
    readonly comment: FieldRef<"Review", 'String'>
    readonly createdAt: FieldRef<"Review", 'DateTime'>
    readonly updatedAt: FieldRef<"Review", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Review findUnique
   */
  export type ReviewFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review findUniqueOrThrow
   */
  export type ReviewFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review findFirst
   */
  export type ReviewFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reviews.
     */
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review findFirstOrThrow
   */
  export type ReviewFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Review to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reviews.
     */
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review findMany
   */
  export type ReviewFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter, which Reviews to fetch.
     */
    where?: ReviewWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reviews to fetch.
     */
    orderBy?: ReviewOrderByWithRelationInput | ReviewOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Reviews.
     */
    cursor?: ReviewWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reviews from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reviews.
     */
    skip?: number
    distinct?: ReviewScalarFieldEnum | ReviewScalarFieldEnum[]
  }

  /**
   * Review create
   */
  export type ReviewCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The data needed to create a Review.
     */
    data: XOR<ReviewCreateInput, ReviewUncheckedCreateInput>
  }

  /**
   * Review createMany
   */
  export type ReviewCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Reviews.
     */
    data: ReviewCreateManyInput | ReviewCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Review createManyAndReturn
   */
  export type ReviewCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * The data used to create many Reviews.
     */
    data: ReviewCreateManyInput | ReviewCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Review update
   */
  export type ReviewUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The data needed to update a Review.
     */
    data: XOR<ReviewUpdateInput, ReviewUncheckedUpdateInput>
    /**
     * Choose, which Review to update.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review updateMany
   */
  export type ReviewUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Reviews.
     */
    data: XOR<ReviewUpdateManyMutationInput, ReviewUncheckedUpdateManyInput>
    /**
     * Filter which Reviews to update
     */
    where?: ReviewWhereInput
    /**
     * Limit how many Reviews to update.
     */
    limit?: number
  }

  /**
   * Review updateManyAndReturn
   */
  export type ReviewUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * The data used to update Reviews.
     */
    data: XOR<ReviewUpdateManyMutationInput, ReviewUncheckedUpdateManyInput>
    /**
     * Filter which Reviews to update
     */
    where?: ReviewWhereInput
    /**
     * Limit how many Reviews to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Review upsert
   */
  export type ReviewUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * The filter to search for the Review to update in case it exists.
     */
    where: ReviewWhereUniqueInput
    /**
     * In case the Review found by the `where` argument doesn't exist, create a new Review with this data.
     */
    create: XOR<ReviewCreateInput, ReviewUncheckedCreateInput>
    /**
     * In case the Review was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReviewUpdateInput, ReviewUncheckedUpdateInput>
  }

  /**
   * Review delete
   */
  export type ReviewDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
    /**
     * Filter which Review to delete.
     */
    where: ReviewWhereUniqueInput
  }

  /**
   * Review deleteMany
   */
  export type ReviewDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reviews to delete
     */
    where?: ReviewWhereInput
    /**
     * Limit how many Reviews to delete.
     */
    limit?: number
  }

  /**
   * Review without action
   */
  export type ReviewDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Review
     */
    select?: ReviewSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Review
     */
    omit?: ReviewOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReviewInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const BookingScalarFieldEnum: {
    id: 'id',
    bookingCode: 'bookingCode',
    tripId: 'tripId',
    userId: 'userId',
    guestEmail: 'guestEmail',
    status: 'status',
    paymentStatus: 'paymentStatus',
    holdToken: 'holdToken',
    ticketSubtotal: 'ticketSubtotal',
    serviceFee: 'serviceFee',
    discountAmount: 'discountAmount',
    totalAmount: 'totalAmount',
    voucherId: 'voucherId',
    voucherCode: 'voucherCode',
    paymentDeadline: 'paymentDeadline',
    routeName: 'routeName',
    origin: 'origin',
    destination: 'destination',
    operatorName: 'operatorName',
    pickupPoint: 'pickupPoint',
    dropoffPoint: 'dropoffPoint',
    departureTime: 'departureTime',
    busPlate: 'busPlate',
    tripType: 'tripType',
    checkedInAt: 'checkedInAt',
    checkedInByUserId: 'checkedInByUserId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BookingScalarFieldEnum = (typeof BookingScalarFieldEnum)[keyof typeof BookingScalarFieldEnum]


  export const VoucherScalarFieldEnum: {
    id: 'id',
    code: 'code',
    name: 'name',
    description: 'description',
    discountType: 'discountType',
    discountValue: 'discountValue',
    maxDiscount: 'maxDiscount',
    minOrderValue: 'minOrderValue',
    startDate: 'startDate',
    endDate: 'endDate',
    usageLimit: 'usageLimit',
    usagePerUser: 'usagePerUser',
    applicableRoutes: 'applicableRoutes',
    applicableBusCompanies: 'applicableBusCompanies',
    applicableTripTypes: 'applicableTripTypes',
    requiresNewUser: 'requiresNewUser',
    isActive: 'isActive',
    usedCount: 'usedCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type VoucherScalarFieldEnum = (typeof VoucherScalarFieldEnum)[keyof typeof VoucherScalarFieldEnum]


  export const VoucherUsageScalarFieldEnum: {
    id: 'id',
    voucherId: 'voucherId',
    bookingId: 'bookingId',
    userId: 'userId',
    guestEmail: 'guestEmail',
    discountAmount: 'discountAmount',
    createdAt: 'createdAt'
  };

  export type VoucherUsageScalarFieldEnum = (typeof VoucherUsageScalarFieldEnum)[keyof typeof VoucherUsageScalarFieldEnum]


  export const PassengerScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    fullName: 'fullName',
    phone: 'phone',
    email: 'email',
    idNumber: 'idNumber',
    seatId: 'seatId'
  };

  export type PassengerScalarFieldEnum = (typeof PassengerScalarFieldEnum)[keyof typeof PassengerScalarFieldEnum]


  export const StatusLogScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    fromStatus: 'fromStatus',
    toStatus: 'toStatus',
    createdAt: 'createdAt'
  };

  export type StatusLogScalarFieldEnum = (typeof StatusLogScalarFieldEnum)[keyof typeof StatusLogScalarFieldEnum]


  export const ReviewScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    userId: 'userId',
    tripId: 'tripId',
    reviewerName: 'reviewerName',
    routeName: 'routeName',
    origin: 'origin',
    destination: 'destination',
    rating: 'rating',
    comment: 'comment',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReviewScalarFieldEnum = (typeof ReviewScalarFieldEnum)[keyof typeof ReviewScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type BookingWhereInput = {
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    id?: StringFilter<"Booking"> | string
    bookingCode?: StringFilter<"Booking"> | string
    tripId?: StringFilter<"Booking"> | string
    userId?: StringNullableFilter<"Booking"> | string | null
    guestEmail?: StringFilter<"Booking"> | string
    status?: StringFilter<"Booking"> | string
    paymentStatus?: StringFilter<"Booking"> | string
    holdToken?: StringNullableFilter<"Booking"> | string | null
    ticketSubtotal?: FloatFilter<"Booking"> | number
    serviceFee?: FloatFilter<"Booking"> | number
    discountAmount?: FloatFilter<"Booking"> | number
    totalAmount?: FloatFilter<"Booking"> | number
    voucherId?: StringNullableFilter<"Booking"> | string | null
    voucherCode?: StringNullableFilter<"Booking"> | string | null
    paymentDeadline?: DateTimeNullableFilter<"Booking"> | Date | string | null
    routeName?: StringFilter<"Booking"> | string
    origin?: StringFilter<"Booking"> | string
    destination?: StringFilter<"Booking"> | string
    operatorName?: StringFilter<"Booking"> | string
    pickupPoint?: StringFilter<"Booking"> | string
    dropoffPoint?: StringFilter<"Booking"> | string
    departureTime?: StringFilter<"Booking"> | string
    busPlate?: StringFilter<"Booking"> | string
    tripType?: StringFilter<"Booking"> | string
    checkedInAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    checkedInByUserId?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
    passengers?: PassengerListRelationFilter
    statusLogs?: StatusLogListRelationFilter
    review?: XOR<ReviewNullableScalarRelationFilter, ReviewWhereInput> | null
    voucher?: XOR<VoucherNullableScalarRelationFilter, VoucherWhereInput> | null
    voucherUsages?: VoucherUsageListRelationFilter
  }

  export type BookingOrderByWithRelationInput = {
    id?: SortOrder
    bookingCode?: SortOrder
    tripId?: SortOrder
    userId?: SortOrderInput | SortOrder
    guestEmail?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    holdToken?: SortOrderInput | SortOrder
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
    voucherId?: SortOrderInput | SortOrder
    voucherCode?: SortOrderInput | SortOrder
    paymentDeadline?: SortOrderInput | SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    operatorName?: SortOrder
    pickupPoint?: SortOrder
    dropoffPoint?: SortOrder
    departureTime?: SortOrder
    busPlate?: SortOrder
    tripType?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    checkedInByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    passengers?: PassengerOrderByRelationAggregateInput
    statusLogs?: StatusLogOrderByRelationAggregateInput
    review?: ReviewOrderByWithRelationInput
    voucher?: VoucherOrderByWithRelationInput
    voucherUsages?: VoucherUsageOrderByRelationAggregateInput
  }

  export type BookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    bookingCode?: string
    AND?: BookingWhereInput | BookingWhereInput[]
    OR?: BookingWhereInput[]
    NOT?: BookingWhereInput | BookingWhereInput[]
    tripId?: StringFilter<"Booking"> | string
    userId?: StringNullableFilter<"Booking"> | string | null
    guestEmail?: StringFilter<"Booking"> | string
    status?: StringFilter<"Booking"> | string
    paymentStatus?: StringFilter<"Booking"> | string
    holdToken?: StringNullableFilter<"Booking"> | string | null
    ticketSubtotal?: FloatFilter<"Booking"> | number
    serviceFee?: FloatFilter<"Booking"> | number
    discountAmount?: FloatFilter<"Booking"> | number
    totalAmount?: FloatFilter<"Booking"> | number
    voucherId?: StringNullableFilter<"Booking"> | string | null
    voucherCode?: StringNullableFilter<"Booking"> | string | null
    paymentDeadline?: DateTimeNullableFilter<"Booking"> | Date | string | null
    routeName?: StringFilter<"Booking"> | string
    origin?: StringFilter<"Booking"> | string
    destination?: StringFilter<"Booking"> | string
    operatorName?: StringFilter<"Booking"> | string
    pickupPoint?: StringFilter<"Booking"> | string
    dropoffPoint?: StringFilter<"Booking"> | string
    departureTime?: StringFilter<"Booking"> | string
    busPlate?: StringFilter<"Booking"> | string
    tripType?: StringFilter<"Booking"> | string
    checkedInAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    checkedInByUserId?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
    passengers?: PassengerListRelationFilter
    statusLogs?: StatusLogListRelationFilter
    review?: XOR<ReviewNullableScalarRelationFilter, ReviewWhereInput> | null
    voucher?: XOR<VoucherNullableScalarRelationFilter, VoucherWhereInput> | null
    voucherUsages?: VoucherUsageListRelationFilter
  }, "id" | "bookingCode">

  export type BookingOrderByWithAggregationInput = {
    id?: SortOrder
    bookingCode?: SortOrder
    tripId?: SortOrder
    userId?: SortOrderInput | SortOrder
    guestEmail?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    holdToken?: SortOrderInput | SortOrder
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
    voucherId?: SortOrderInput | SortOrder
    voucherCode?: SortOrderInput | SortOrder
    paymentDeadline?: SortOrderInput | SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    operatorName?: SortOrder
    pickupPoint?: SortOrder
    dropoffPoint?: SortOrder
    departureTime?: SortOrder
    busPlate?: SortOrder
    tripType?: SortOrder
    checkedInAt?: SortOrderInput | SortOrder
    checkedInByUserId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BookingCountOrderByAggregateInput
    _avg?: BookingAvgOrderByAggregateInput
    _max?: BookingMaxOrderByAggregateInput
    _min?: BookingMinOrderByAggregateInput
    _sum?: BookingSumOrderByAggregateInput
  }

  export type BookingScalarWhereWithAggregatesInput = {
    AND?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    OR?: BookingScalarWhereWithAggregatesInput[]
    NOT?: BookingScalarWhereWithAggregatesInput | BookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Booking"> | string
    bookingCode?: StringWithAggregatesFilter<"Booking"> | string
    tripId?: StringWithAggregatesFilter<"Booking"> | string
    userId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    guestEmail?: StringWithAggregatesFilter<"Booking"> | string
    status?: StringWithAggregatesFilter<"Booking"> | string
    paymentStatus?: StringWithAggregatesFilter<"Booking"> | string
    holdToken?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    ticketSubtotal?: FloatWithAggregatesFilter<"Booking"> | number
    serviceFee?: FloatWithAggregatesFilter<"Booking"> | number
    discountAmount?: FloatWithAggregatesFilter<"Booking"> | number
    totalAmount?: FloatWithAggregatesFilter<"Booking"> | number
    voucherId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    voucherCode?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    paymentDeadline?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    routeName?: StringWithAggregatesFilter<"Booking"> | string
    origin?: StringWithAggregatesFilter<"Booking"> | string
    destination?: StringWithAggregatesFilter<"Booking"> | string
    operatorName?: StringWithAggregatesFilter<"Booking"> | string
    pickupPoint?: StringWithAggregatesFilter<"Booking"> | string
    dropoffPoint?: StringWithAggregatesFilter<"Booking"> | string
    departureTime?: StringWithAggregatesFilter<"Booking"> | string
    busPlate?: StringWithAggregatesFilter<"Booking"> | string
    tripType?: StringWithAggregatesFilter<"Booking"> | string
    checkedInAt?: DateTimeNullableWithAggregatesFilter<"Booking"> | Date | string | null
    checkedInByUserId?: StringNullableWithAggregatesFilter<"Booking"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Booking"> | Date | string
  }

  export type VoucherWhereInput = {
    AND?: VoucherWhereInput | VoucherWhereInput[]
    OR?: VoucherWhereInput[]
    NOT?: VoucherWhereInput | VoucherWhereInput[]
    id?: StringFilter<"Voucher"> | string
    code?: StringFilter<"Voucher"> | string
    name?: StringFilter<"Voucher"> | string
    description?: StringFilter<"Voucher"> | string
    discountType?: StringFilter<"Voucher"> | string
    discountValue?: FloatFilter<"Voucher"> | number
    maxDiscount?: FloatNullableFilter<"Voucher"> | number | null
    minOrderValue?: FloatFilter<"Voucher"> | number
    startDate?: DateTimeFilter<"Voucher"> | Date | string
    endDate?: DateTimeFilter<"Voucher"> | Date | string
    usageLimit?: IntNullableFilter<"Voucher"> | number | null
    usagePerUser?: IntNullableFilter<"Voucher"> | number | null
    applicableRoutes?: StringFilter<"Voucher"> | string
    applicableBusCompanies?: StringFilter<"Voucher"> | string
    applicableTripTypes?: StringFilter<"Voucher"> | string
    requiresNewUser?: BoolFilter<"Voucher"> | boolean
    isActive?: BoolFilter<"Voucher"> | boolean
    usedCount?: IntFilter<"Voucher"> | number
    createdAt?: DateTimeFilter<"Voucher"> | Date | string
    updatedAt?: DateTimeFilter<"Voucher"> | Date | string
    bookings?: BookingListRelationFilter
    usages?: VoucherUsageListRelationFilter
  }

  export type VoucherOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    maxDiscount?: SortOrderInput | SortOrder
    minOrderValue?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    usageLimit?: SortOrderInput | SortOrder
    usagePerUser?: SortOrderInput | SortOrder
    applicableRoutes?: SortOrder
    applicableBusCompanies?: SortOrder
    applicableTripTypes?: SortOrder
    requiresNewUser?: SortOrder
    isActive?: SortOrder
    usedCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    bookings?: BookingOrderByRelationAggregateInput
    usages?: VoucherUsageOrderByRelationAggregateInput
  }

  export type VoucherWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    code?: string
    AND?: VoucherWhereInput | VoucherWhereInput[]
    OR?: VoucherWhereInput[]
    NOT?: VoucherWhereInput | VoucherWhereInput[]
    name?: StringFilter<"Voucher"> | string
    description?: StringFilter<"Voucher"> | string
    discountType?: StringFilter<"Voucher"> | string
    discountValue?: FloatFilter<"Voucher"> | number
    maxDiscount?: FloatNullableFilter<"Voucher"> | number | null
    minOrderValue?: FloatFilter<"Voucher"> | number
    startDate?: DateTimeFilter<"Voucher"> | Date | string
    endDate?: DateTimeFilter<"Voucher"> | Date | string
    usageLimit?: IntNullableFilter<"Voucher"> | number | null
    usagePerUser?: IntNullableFilter<"Voucher"> | number | null
    applicableRoutes?: StringFilter<"Voucher"> | string
    applicableBusCompanies?: StringFilter<"Voucher"> | string
    applicableTripTypes?: StringFilter<"Voucher"> | string
    requiresNewUser?: BoolFilter<"Voucher"> | boolean
    isActive?: BoolFilter<"Voucher"> | boolean
    usedCount?: IntFilter<"Voucher"> | number
    createdAt?: DateTimeFilter<"Voucher"> | Date | string
    updatedAt?: DateTimeFilter<"Voucher"> | Date | string
    bookings?: BookingListRelationFilter
    usages?: VoucherUsageListRelationFilter
  }, "id" | "code">

  export type VoucherOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    maxDiscount?: SortOrderInput | SortOrder
    minOrderValue?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    usageLimit?: SortOrderInput | SortOrder
    usagePerUser?: SortOrderInput | SortOrder
    applicableRoutes?: SortOrder
    applicableBusCompanies?: SortOrder
    applicableTripTypes?: SortOrder
    requiresNewUser?: SortOrder
    isActive?: SortOrder
    usedCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: VoucherCountOrderByAggregateInput
    _avg?: VoucherAvgOrderByAggregateInput
    _max?: VoucherMaxOrderByAggregateInput
    _min?: VoucherMinOrderByAggregateInput
    _sum?: VoucherSumOrderByAggregateInput
  }

  export type VoucherScalarWhereWithAggregatesInput = {
    AND?: VoucherScalarWhereWithAggregatesInput | VoucherScalarWhereWithAggregatesInput[]
    OR?: VoucherScalarWhereWithAggregatesInput[]
    NOT?: VoucherScalarWhereWithAggregatesInput | VoucherScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Voucher"> | string
    code?: StringWithAggregatesFilter<"Voucher"> | string
    name?: StringWithAggregatesFilter<"Voucher"> | string
    description?: StringWithAggregatesFilter<"Voucher"> | string
    discountType?: StringWithAggregatesFilter<"Voucher"> | string
    discountValue?: FloatWithAggregatesFilter<"Voucher"> | number
    maxDiscount?: FloatNullableWithAggregatesFilter<"Voucher"> | number | null
    minOrderValue?: FloatWithAggregatesFilter<"Voucher"> | number
    startDate?: DateTimeWithAggregatesFilter<"Voucher"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"Voucher"> | Date | string
    usageLimit?: IntNullableWithAggregatesFilter<"Voucher"> | number | null
    usagePerUser?: IntNullableWithAggregatesFilter<"Voucher"> | number | null
    applicableRoutes?: StringWithAggregatesFilter<"Voucher"> | string
    applicableBusCompanies?: StringWithAggregatesFilter<"Voucher"> | string
    applicableTripTypes?: StringWithAggregatesFilter<"Voucher"> | string
    requiresNewUser?: BoolWithAggregatesFilter<"Voucher"> | boolean
    isActive?: BoolWithAggregatesFilter<"Voucher"> | boolean
    usedCount?: IntWithAggregatesFilter<"Voucher"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Voucher"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Voucher"> | Date | string
  }

  export type VoucherUsageWhereInput = {
    AND?: VoucherUsageWhereInput | VoucherUsageWhereInput[]
    OR?: VoucherUsageWhereInput[]
    NOT?: VoucherUsageWhereInput | VoucherUsageWhereInput[]
    id?: StringFilter<"VoucherUsage"> | string
    voucherId?: StringFilter<"VoucherUsage"> | string
    bookingId?: StringFilter<"VoucherUsage"> | string
    userId?: StringNullableFilter<"VoucherUsage"> | string | null
    guestEmail?: StringNullableFilter<"VoucherUsage"> | string | null
    discountAmount?: FloatFilter<"VoucherUsage"> | number
    createdAt?: DateTimeFilter<"VoucherUsage"> | Date | string
    voucher?: XOR<VoucherScalarRelationFilter, VoucherWhereInput>
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }

  export type VoucherUsageOrderByWithRelationInput = {
    id?: SortOrder
    voucherId?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrderInput | SortOrder
    guestEmail?: SortOrderInput | SortOrder
    discountAmount?: SortOrder
    createdAt?: SortOrder
    voucher?: VoucherOrderByWithRelationInput
    booking?: BookingOrderByWithRelationInput
  }

  export type VoucherUsageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: VoucherUsageWhereInput | VoucherUsageWhereInput[]
    OR?: VoucherUsageWhereInput[]
    NOT?: VoucherUsageWhereInput | VoucherUsageWhereInput[]
    voucherId?: StringFilter<"VoucherUsage"> | string
    bookingId?: StringFilter<"VoucherUsage"> | string
    userId?: StringNullableFilter<"VoucherUsage"> | string | null
    guestEmail?: StringNullableFilter<"VoucherUsage"> | string | null
    discountAmount?: FloatFilter<"VoucherUsage"> | number
    createdAt?: DateTimeFilter<"VoucherUsage"> | Date | string
    voucher?: XOR<VoucherScalarRelationFilter, VoucherWhereInput>
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }, "id">

  export type VoucherUsageOrderByWithAggregationInput = {
    id?: SortOrder
    voucherId?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrderInput | SortOrder
    guestEmail?: SortOrderInput | SortOrder
    discountAmount?: SortOrder
    createdAt?: SortOrder
    _count?: VoucherUsageCountOrderByAggregateInput
    _avg?: VoucherUsageAvgOrderByAggregateInput
    _max?: VoucherUsageMaxOrderByAggregateInput
    _min?: VoucherUsageMinOrderByAggregateInput
    _sum?: VoucherUsageSumOrderByAggregateInput
  }

  export type VoucherUsageScalarWhereWithAggregatesInput = {
    AND?: VoucherUsageScalarWhereWithAggregatesInput | VoucherUsageScalarWhereWithAggregatesInput[]
    OR?: VoucherUsageScalarWhereWithAggregatesInput[]
    NOT?: VoucherUsageScalarWhereWithAggregatesInput | VoucherUsageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"VoucherUsage"> | string
    voucherId?: StringWithAggregatesFilter<"VoucherUsage"> | string
    bookingId?: StringWithAggregatesFilter<"VoucherUsage"> | string
    userId?: StringNullableWithAggregatesFilter<"VoucherUsage"> | string | null
    guestEmail?: StringNullableWithAggregatesFilter<"VoucherUsage"> | string | null
    discountAmount?: FloatWithAggregatesFilter<"VoucherUsage"> | number
    createdAt?: DateTimeWithAggregatesFilter<"VoucherUsage"> | Date | string
  }

  export type PassengerWhereInput = {
    AND?: PassengerWhereInput | PassengerWhereInput[]
    OR?: PassengerWhereInput[]
    NOT?: PassengerWhereInput | PassengerWhereInput[]
    id?: StringFilter<"Passenger"> | string
    bookingId?: StringFilter<"Passenger"> | string
    fullName?: StringFilter<"Passenger"> | string
    phone?: StringFilter<"Passenger"> | string
    email?: StringFilter<"Passenger"> | string
    idNumber?: StringNullableFilter<"Passenger"> | string | null
    seatId?: StringFilter<"Passenger"> | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }

  export type PassengerOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    idNumber?: SortOrderInput | SortOrder
    seatId?: SortOrder
    booking?: BookingOrderByWithRelationInput
  }

  export type PassengerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PassengerWhereInput | PassengerWhereInput[]
    OR?: PassengerWhereInput[]
    NOT?: PassengerWhereInput | PassengerWhereInput[]
    bookingId?: StringFilter<"Passenger"> | string
    fullName?: StringFilter<"Passenger"> | string
    phone?: StringFilter<"Passenger"> | string
    email?: StringFilter<"Passenger"> | string
    idNumber?: StringNullableFilter<"Passenger"> | string | null
    seatId?: StringFilter<"Passenger"> | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }, "id">

  export type PassengerOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    idNumber?: SortOrderInput | SortOrder
    seatId?: SortOrder
    _count?: PassengerCountOrderByAggregateInput
    _max?: PassengerMaxOrderByAggregateInput
    _min?: PassengerMinOrderByAggregateInput
  }

  export type PassengerScalarWhereWithAggregatesInput = {
    AND?: PassengerScalarWhereWithAggregatesInput | PassengerScalarWhereWithAggregatesInput[]
    OR?: PassengerScalarWhereWithAggregatesInput[]
    NOT?: PassengerScalarWhereWithAggregatesInput | PassengerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Passenger"> | string
    bookingId?: StringWithAggregatesFilter<"Passenger"> | string
    fullName?: StringWithAggregatesFilter<"Passenger"> | string
    phone?: StringWithAggregatesFilter<"Passenger"> | string
    email?: StringWithAggregatesFilter<"Passenger"> | string
    idNumber?: StringNullableWithAggregatesFilter<"Passenger"> | string | null
    seatId?: StringWithAggregatesFilter<"Passenger"> | string
  }

  export type StatusLogWhereInput = {
    AND?: StatusLogWhereInput | StatusLogWhereInput[]
    OR?: StatusLogWhereInput[]
    NOT?: StatusLogWhereInput | StatusLogWhereInput[]
    id?: StringFilter<"StatusLog"> | string
    bookingId?: StringFilter<"StatusLog"> | string
    fromStatus?: StringNullableFilter<"StatusLog"> | string | null
    toStatus?: StringFilter<"StatusLog"> | string
    createdAt?: DateTimeFilter<"StatusLog"> | Date | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }

  export type StatusLogOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fromStatus?: SortOrderInput | SortOrder
    toStatus?: SortOrder
    createdAt?: SortOrder
    booking?: BookingOrderByWithRelationInput
  }

  export type StatusLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StatusLogWhereInput | StatusLogWhereInput[]
    OR?: StatusLogWhereInput[]
    NOT?: StatusLogWhereInput | StatusLogWhereInput[]
    bookingId?: StringFilter<"StatusLog"> | string
    fromStatus?: StringNullableFilter<"StatusLog"> | string | null
    toStatus?: StringFilter<"StatusLog"> | string
    createdAt?: DateTimeFilter<"StatusLog"> | Date | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }, "id">

  export type StatusLogOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fromStatus?: SortOrderInput | SortOrder
    toStatus?: SortOrder
    createdAt?: SortOrder
    _count?: StatusLogCountOrderByAggregateInput
    _max?: StatusLogMaxOrderByAggregateInput
    _min?: StatusLogMinOrderByAggregateInput
  }

  export type StatusLogScalarWhereWithAggregatesInput = {
    AND?: StatusLogScalarWhereWithAggregatesInput | StatusLogScalarWhereWithAggregatesInput[]
    OR?: StatusLogScalarWhereWithAggregatesInput[]
    NOT?: StatusLogScalarWhereWithAggregatesInput | StatusLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StatusLog"> | string
    bookingId?: StringWithAggregatesFilter<"StatusLog"> | string
    fromStatus?: StringNullableWithAggregatesFilter<"StatusLog"> | string | null
    toStatus?: StringWithAggregatesFilter<"StatusLog"> | string
    createdAt?: DateTimeWithAggregatesFilter<"StatusLog"> | Date | string
  }

  export type ReviewWhereInput = {
    AND?: ReviewWhereInput | ReviewWhereInput[]
    OR?: ReviewWhereInput[]
    NOT?: ReviewWhereInput | ReviewWhereInput[]
    id?: StringFilter<"Review"> | string
    bookingId?: StringFilter<"Review"> | string
    userId?: StringFilter<"Review"> | string
    tripId?: StringFilter<"Review"> | string
    reviewerName?: StringFilter<"Review"> | string
    routeName?: StringFilter<"Review"> | string
    origin?: StringFilter<"Review"> | string
    destination?: StringFilter<"Review"> | string
    rating?: IntFilter<"Review"> | number
    comment?: StringFilter<"Review"> | string
    createdAt?: DateTimeFilter<"Review"> | Date | string
    updatedAt?: DateTimeFilter<"Review"> | Date | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }

  export type ReviewOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    tripId?: SortOrder
    reviewerName?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    booking?: BookingOrderByWithRelationInput
  }

  export type ReviewWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    bookingId?: string
    AND?: ReviewWhereInput | ReviewWhereInput[]
    OR?: ReviewWhereInput[]
    NOT?: ReviewWhereInput | ReviewWhereInput[]
    userId?: StringFilter<"Review"> | string
    tripId?: StringFilter<"Review"> | string
    reviewerName?: StringFilter<"Review"> | string
    routeName?: StringFilter<"Review"> | string
    origin?: StringFilter<"Review"> | string
    destination?: StringFilter<"Review"> | string
    rating?: IntFilter<"Review"> | number
    comment?: StringFilter<"Review"> | string
    createdAt?: DateTimeFilter<"Review"> | Date | string
    updatedAt?: DateTimeFilter<"Review"> | Date | string
    booking?: XOR<BookingScalarRelationFilter, BookingWhereInput>
  }, "id" | "bookingId">

  export type ReviewOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    tripId?: SortOrder
    reviewerName?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReviewCountOrderByAggregateInput
    _avg?: ReviewAvgOrderByAggregateInput
    _max?: ReviewMaxOrderByAggregateInput
    _min?: ReviewMinOrderByAggregateInput
    _sum?: ReviewSumOrderByAggregateInput
  }

  export type ReviewScalarWhereWithAggregatesInput = {
    AND?: ReviewScalarWhereWithAggregatesInput | ReviewScalarWhereWithAggregatesInput[]
    OR?: ReviewScalarWhereWithAggregatesInput[]
    NOT?: ReviewScalarWhereWithAggregatesInput | ReviewScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Review"> | string
    bookingId?: StringWithAggregatesFilter<"Review"> | string
    userId?: StringWithAggregatesFilter<"Review"> | string
    tripId?: StringWithAggregatesFilter<"Review"> | string
    reviewerName?: StringWithAggregatesFilter<"Review"> | string
    routeName?: StringWithAggregatesFilter<"Review"> | string
    origin?: StringWithAggregatesFilter<"Review"> | string
    destination?: StringWithAggregatesFilter<"Review"> | string
    rating?: IntWithAggregatesFilter<"Review"> | number
    comment?: StringWithAggregatesFilter<"Review"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Review"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Review"> | Date | string
  }

  export type BookingCreateInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogCreateNestedManyWithoutBookingInput
    review?: ReviewCreateNestedOneWithoutBookingInput
    voucher?: VoucherCreateNestedOneWithoutBookingsInput
    voucherUsages?: VoucherUsageCreateNestedManyWithoutBookingInput
  }

  export type BookingUncheckedCreateInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerUncheckedCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogUncheckedCreateNestedManyWithoutBookingInput
    review?: ReviewUncheckedCreateNestedOneWithoutBookingInput
    voucherUsages?: VoucherUsageUncheckedCreateNestedManyWithoutBookingInput
  }

  export type BookingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUpdateManyWithoutBookingNestedInput
    review?: ReviewUpdateOneWithoutBookingNestedInput
    voucher?: VoucherUpdateOneWithoutBookingsNestedInput
    voucherUsages?: VoucherUsageUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUncheckedUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUncheckedUpdateManyWithoutBookingNestedInput
    review?: ReviewUncheckedUpdateOneWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type BookingCreateManyInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BookingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherCreateInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutVoucherInput
    usages?: VoucherUsageCreateNestedManyWithoutVoucherInput
  }

  export type VoucherUncheckedCreateInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutVoucherInput
    usages?: VoucherUsageUncheckedCreateNestedManyWithoutVoucherInput
  }

  export type VoucherUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutVoucherNestedInput
    usages?: VoucherUsageUpdateManyWithoutVoucherNestedInput
  }

  export type VoucherUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutVoucherNestedInput
    usages?: VoucherUsageUncheckedUpdateManyWithoutVoucherNestedInput
  }

  export type VoucherCreateManyInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VoucherUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageCreateInput = {
    id?: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
    voucher: VoucherCreateNestedOneWithoutUsagesInput
    booking: BookingCreateNestedOneWithoutVoucherUsagesInput
  }

  export type VoucherUsageUncheckedCreateInput = {
    id?: string
    voucherId: string
    bookingId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type VoucherUsageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    voucher?: VoucherUpdateOneRequiredWithoutUsagesNestedInput
    booking?: BookingUpdateOneRequiredWithoutVoucherUsagesNestedInput
  }

  export type VoucherUsageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    voucherId?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageCreateManyInput = {
    id?: string
    voucherId: string
    bookingId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type VoucherUsageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    voucherId?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PassengerCreateInput = {
    id?: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
    booking: BookingCreateNestedOneWithoutPassengersInput
  }

  export type PassengerUncheckedCreateInput = {
    id?: string
    bookingId: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
  }

  export type PassengerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
    booking?: BookingUpdateOneRequiredWithoutPassengersNestedInput
  }

  export type PassengerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type PassengerCreateManyInput = {
    id?: string
    bookingId: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
  }

  export type PassengerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type PassengerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type StatusLogCreateInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
    booking: BookingCreateNestedOneWithoutStatusLogsInput
  }

  export type StatusLogUncheckedCreateInput = {
    id?: string
    bookingId: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
  }

  export type StatusLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: BookingUpdateOneRequiredWithoutStatusLogsNestedInput
  }

  export type StatusLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusLogCreateManyInput = {
    id?: string
    bookingId: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
  }

  export type StatusLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewCreateInput = {
    id?: string
    userId: string
    tripId: string
    reviewerName: string
    routeName?: string
    origin?: string
    destination?: string
    rating: number
    comment?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    booking: BookingCreateNestedOneWithoutReviewInput
  }

  export type ReviewUncheckedCreateInput = {
    id?: string
    bookingId: string
    userId: string
    tripId: string
    reviewerName: string
    routeName?: string
    origin?: string
    destination?: string
    rating: number
    comment?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: BookingUpdateOneRequiredWithoutReviewNestedInput
  }

  export type ReviewUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewCreateManyInput = {
    id?: string
    bookingId: string
    userId: string
    tripId: string
    reviewerName: string
    routeName?: string
    origin?: string
    destination?: string
    rating: number
    comment?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type PassengerListRelationFilter = {
    every?: PassengerWhereInput
    some?: PassengerWhereInput
    none?: PassengerWhereInput
  }

  export type StatusLogListRelationFilter = {
    every?: StatusLogWhereInput
    some?: StatusLogWhereInput
    none?: StatusLogWhereInput
  }

  export type ReviewNullableScalarRelationFilter = {
    is?: ReviewWhereInput | null
    isNot?: ReviewWhereInput | null
  }

  export type VoucherNullableScalarRelationFilter = {
    is?: VoucherWhereInput | null
    isNot?: VoucherWhereInput | null
  }

  export type VoucherUsageListRelationFilter = {
    every?: VoucherUsageWhereInput
    some?: VoucherUsageWhereInput
    none?: VoucherUsageWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type PassengerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StatusLogOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VoucherUsageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BookingCountOrderByAggregateInput = {
    id?: SortOrder
    bookingCode?: SortOrder
    tripId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    holdToken?: SortOrder
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
    voucherId?: SortOrder
    voucherCode?: SortOrder
    paymentDeadline?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    operatorName?: SortOrder
    pickupPoint?: SortOrder
    dropoffPoint?: SortOrder
    departureTime?: SortOrder
    busPlate?: SortOrder
    tripType?: SortOrder
    checkedInAt?: SortOrder
    checkedInByUserId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookingAvgOrderByAggregateInput = {
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
  }

  export type BookingMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingCode?: SortOrder
    tripId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    holdToken?: SortOrder
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
    voucherId?: SortOrder
    voucherCode?: SortOrder
    paymentDeadline?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    operatorName?: SortOrder
    pickupPoint?: SortOrder
    dropoffPoint?: SortOrder
    departureTime?: SortOrder
    busPlate?: SortOrder
    tripType?: SortOrder
    checkedInAt?: SortOrder
    checkedInByUserId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookingMinOrderByAggregateInput = {
    id?: SortOrder
    bookingCode?: SortOrder
    tripId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    status?: SortOrder
    paymentStatus?: SortOrder
    holdToken?: SortOrder
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
    voucherId?: SortOrder
    voucherCode?: SortOrder
    paymentDeadline?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    operatorName?: SortOrder
    pickupPoint?: SortOrder
    dropoffPoint?: SortOrder
    departureTime?: SortOrder
    busPlate?: SortOrder
    tripType?: SortOrder
    checkedInAt?: SortOrder
    checkedInByUserId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BookingSumOrderByAggregateInput = {
    ticketSubtotal?: SortOrder
    serviceFee?: SortOrder
    discountAmount?: SortOrder
    totalAmount?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BookingListRelationFilter = {
    every?: BookingWhereInput
    some?: BookingWhereInput
    none?: BookingWhereInput
  }

  export type BookingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type VoucherCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    maxDiscount?: SortOrder
    minOrderValue?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    usageLimit?: SortOrder
    usagePerUser?: SortOrder
    applicableRoutes?: SortOrder
    applicableBusCompanies?: SortOrder
    applicableTripTypes?: SortOrder
    requiresNewUser?: SortOrder
    isActive?: SortOrder
    usedCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VoucherAvgOrderByAggregateInput = {
    discountValue?: SortOrder
    maxDiscount?: SortOrder
    minOrderValue?: SortOrder
    usageLimit?: SortOrder
    usagePerUser?: SortOrder
    usedCount?: SortOrder
  }

  export type VoucherMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    maxDiscount?: SortOrder
    minOrderValue?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    usageLimit?: SortOrder
    usagePerUser?: SortOrder
    applicableRoutes?: SortOrder
    applicableBusCompanies?: SortOrder
    applicableTripTypes?: SortOrder
    requiresNewUser?: SortOrder
    isActive?: SortOrder
    usedCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VoucherMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    name?: SortOrder
    description?: SortOrder
    discountType?: SortOrder
    discountValue?: SortOrder
    maxDiscount?: SortOrder
    minOrderValue?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    usageLimit?: SortOrder
    usagePerUser?: SortOrder
    applicableRoutes?: SortOrder
    applicableBusCompanies?: SortOrder
    applicableTripTypes?: SortOrder
    requiresNewUser?: SortOrder
    isActive?: SortOrder
    usedCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type VoucherSumOrderByAggregateInput = {
    discountValue?: SortOrder
    maxDiscount?: SortOrder
    minOrderValue?: SortOrder
    usageLimit?: SortOrder
    usagePerUser?: SortOrder
    usedCount?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type VoucherScalarRelationFilter = {
    is?: VoucherWhereInput
    isNot?: VoucherWhereInput
  }

  export type BookingScalarRelationFilter = {
    is?: BookingWhereInput
    isNot?: BookingWhereInput
  }

  export type VoucherUsageCountOrderByAggregateInput = {
    id?: SortOrder
    voucherId?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    discountAmount?: SortOrder
    createdAt?: SortOrder
  }

  export type VoucherUsageAvgOrderByAggregateInput = {
    discountAmount?: SortOrder
  }

  export type VoucherUsageMaxOrderByAggregateInput = {
    id?: SortOrder
    voucherId?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    discountAmount?: SortOrder
    createdAt?: SortOrder
  }

  export type VoucherUsageMinOrderByAggregateInput = {
    id?: SortOrder
    voucherId?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    guestEmail?: SortOrder
    discountAmount?: SortOrder
    createdAt?: SortOrder
  }

  export type VoucherUsageSumOrderByAggregateInput = {
    discountAmount?: SortOrder
  }

  export type PassengerCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    idNumber?: SortOrder
    seatId?: SortOrder
  }

  export type PassengerMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    idNumber?: SortOrder
    seatId?: SortOrder
  }

  export type PassengerMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fullName?: SortOrder
    phone?: SortOrder
    email?: SortOrder
    idNumber?: SortOrder
    seatId?: SortOrder
  }

  export type StatusLogCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type StatusLogMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type StatusLogMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    fromStatus?: SortOrder
    toStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type ReviewCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    tripId?: SortOrder
    reviewerName?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewAvgOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type ReviewMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    tripId?: SortOrder
    reviewerName?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    userId?: SortOrder
    tripId?: SortOrder
    reviewerName?: SortOrder
    routeName?: SortOrder
    origin?: SortOrder
    destination?: SortOrder
    rating?: SortOrder
    comment?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReviewSumOrderByAggregateInput = {
    rating?: SortOrder
  }

  export type PassengerCreateNestedManyWithoutBookingInput = {
    create?: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput> | PassengerCreateWithoutBookingInput[] | PassengerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: PassengerCreateOrConnectWithoutBookingInput | PassengerCreateOrConnectWithoutBookingInput[]
    createMany?: PassengerCreateManyBookingInputEnvelope
    connect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
  }

  export type StatusLogCreateNestedManyWithoutBookingInput = {
    create?: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput> | StatusLogCreateWithoutBookingInput[] | StatusLogUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: StatusLogCreateOrConnectWithoutBookingInput | StatusLogCreateOrConnectWithoutBookingInput[]
    createMany?: StatusLogCreateManyBookingInputEnvelope
    connect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
  }

  export type ReviewCreateNestedOneWithoutBookingInput = {
    create?: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutBookingInput
    connect?: ReviewWhereUniqueInput
  }

  export type VoucherCreateNestedOneWithoutBookingsInput = {
    create?: XOR<VoucherCreateWithoutBookingsInput, VoucherUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: VoucherCreateOrConnectWithoutBookingsInput
    connect?: VoucherWhereUniqueInput
  }

  export type VoucherUsageCreateNestedManyWithoutBookingInput = {
    create?: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput> | VoucherUsageCreateWithoutBookingInput[] | VoucherUsageUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutBookingInput | VoucherUsageCreateOrConnectWithoutBookingInput[]
    createMany?: VoucherUsageCreateManyBookingInputEnvelope
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
  }

  export type PassengerUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput> | PassengerCreateWithoutBookingInput[] | PassengerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: PassengerCreateOrConnectWithoutBookingInput | PassengerCreateOrConnectWithoutBookingInput[]
    createMany?: PassengerCreateManyBookingInputEnvelope
    connect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
  }

  export type StatusLogUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput> | StatusLogCreateWithoutBookingInput[] | StatusLogUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: StatusLogCreateOrConnectWithoutBookingInput | StatusLogCreateOrConnectWithoutBookingInput[]
    createMany?: StatusLogCreateManyBookingInputEnvelope
    connect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
  }

  export type ReviewUncheckedCreateNestedOneWithoutBookingInput = {
    create?: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutBookingInput
    connect?: ReviewWhereUniqueInput
  }

  export type VoucherUsageUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput> | VoucherUsageCreateWithoutBookingInput[] | VoucherUsageUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutBookingInput | VoucherUsageCreateOrConnectWithoutBookingInput[]
    createMany?: VoucherUsageCreateManyBookingInputEnvelope
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type PassengerUpdateManyWithoutBookingNestedInput = {
    create?: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput> | PassengerCreateWithoutBookingInput[] | PassengerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: PassengerCreateOrConnectWithoutBookingInput | PassengerCreateOrConnectWithoutBookingInput[]
    upsert?: PassengerUpsertWithWhereUniqueWithoutBookingInput | PassengerUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: PassengerCreateManyBookingInputEnvelope
    set?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    disconnect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    delete?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    connect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    update?: PassengerUpdateWithWhereUniqueWithoutBookingInput | PassengerUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: PassengerUpdateManyWithWhereWithoutBookingInput | PassengerUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: PassengerScalarWhereInput | PassengerScalarWhereInput[]
  }

  export type StatusLogUpdateManyWithoutBookingNestedInput = {
    create?: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput> | StatusLogCreateWithoutBookingInput[] | StatusLogUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: StatusLogCreateOrConnectWithoutBookingInput | StatusLogCreateOrConnectWithoutBookingInput[]
    upsert?: StatusLogUpsertWithWhereUniqueWithoutBookingInput | StatusLogUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: StatusLogCreateManyBookingInputEnvelope
    set?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    disconnect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    delete?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    connect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    update?: StatusLogUpdateWithWhereUniqueWithoutBookingInput | StatusLogUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: StatusLogUpdateManyWithWhereWithoutBookingInput | StatusLogUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: StatusLogScalarWhereInput | StatusLogScalarWhereInput[]
  }

  export type ReviewUpdateOneWithoutBookingNestedInput = {
    create?: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutBookingInput
    upsert?: ReviewUpsertWithoutBookingInput
    disconnect?: ReviewWhereInput | boolean
    delete?: ReviewWhereInput | boolean
    connect?: ReviewWhereUniqueInput
    update?: XOR<XOR<ReviewUpdateToOneWithWhereWithoutBookingInput, ReviewUpdateWithoutBookingInput>, ReviewUncheckedUpdateWithoutBookingInput>
  }

  export type VoucherUpdateOneWithoutBookingsNestedInput = {
    create?: XOR<VoucherCreateWithoutBookingsInput, VoucherUncheckedCreateWithoutBookingsInput>
    connectOrCreate?: VoucherCreateOrConnectWithoutBookingsInput
    upsert?: VoucherUpsertWithoutBookingsInput
    disconnect?: VoucherWhereInput | boolean
    delete?: VoucherWhereInput | boolean
    connect?: VoucherWhereUniqueInput
    update?: XOR<XOR<VoucherUpdateToOneWithWhereWithoutBookingsInput, VoucherUpdateWithoutBookingsInput>, VoucherUncheckedUpdateWithoutBookingsInput>
  }

  export type VoucherUsageUpdateManyWithoutBookingNestedInput = {
    create?: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput> | VoucherUsageCreateWithoutBookingInput[] | VoucherUsageUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutBookingInput | VoucherUsageCreateOrConnectWithoutBookingInput[]
    upsert?: VoucherUsageUpsertWithWhereUniqueWithoutBookingInput | VoucherUsageUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: VoucherUsageCreateManyBookingInputEnvelope
    set?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    disconnect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    delete?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    update?: VoucherUsageUpdateWithWhereUniqueWithoutBookingInput | VoucherUsageUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: VoucherUsageUpdateManyWithWhereWithoutBookingInput | VoucherUsageUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
  }

  export type PassengerUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput> | PassengerCreateWithoutBookingInput[] | PassengerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: PassengerCreateOrConnectWithoutBookingInput | PassengerCreateOrConnectWithoutBookingInput[]
    upsert?: PassengerUpsertWithWhereUniqueWithoutBookingInput | PassengerUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: PassengerCreateManyBookingInputEnvelope
    set?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    disconnect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    delete?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    connect?: PassengerWhereUniqueInput | PassengerWhereUniqueInput[]
    update?: PassengerUpdateWithWhereUniqueWithoutBookingInput | PassengerUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: PassengerUpdateManyWithWhereWithoutBookingInput | PassengerUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: PassengerScalarWhereInput | PassengerScalarWhereInput[]
  }

  export type StatusLogUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput> | StatusLogCreateWithoutBookingInput[] | StatusLogUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: StatusLogCreateOrConnectWithoutBookingInput | StatusLogCreateOrConnectWithoutBookingInput[]
    upsert?: StatusLogUpsertWithWhereUniqueWithoutBookingInput | StatusLogUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: StatusLogCreateManyBookingInputEnvelope
    set?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    disconnect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    delete?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    connect?: StatusLogWhereUniqueInput | StatusLogWhereUniqueInput[]
    update?: StatusLogUpdateWithWhereUniqueWithoutBookingInput | StatusLogUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: StatusLogUpdateManyWithWhereWithoutBookingInput | StatusLogUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: StatusLogScalarWhereInput | StatusLogScalarWhereInput[]
  }

  export type ReviewUncheckedUpdateOneWithoutBookingNestedInput = {
    create?: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
    connectOrCreate?: ReviewCreateOrConnectWithoutBookingInput
    upsert?: ReviewUpsertWithoutBookingInput
    disconnect?: ReviewWhereInput | boolean
    delete?: ReviewWhereInput | boolean
    connect?: ReviewWhereUniqueInput
    update?: XOR<XOR<ReviewUpdateToOneWithWhereWithoutBookingInput, ReviewUpdateWithoutBookingInput>, ReviewUncheckedUpdateWithoutBookingInput>
  }

  export type VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput> | VoucherUsageCreateWithoutBookingInput[] | VoucherUsageUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutBookingInput | VoucherUsageCreateOrConnectWithoutBookingInput[]
    upsert?: VoucherUsageUpsertWithWhereUniqueWithoutBookingInput | VoucherUsageUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: VoucherUsageCreateManyBookingInputEnvelope
    set?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    disconnect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    delete?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    update?: VoucherUsageUpdateWithWhereUniqueWithoutBookingInput | VoucherUsageUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: VoucherUsageUpdateManyWithWhereWithoutBookingInput | VoucherUsageUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
  }

  export type BookingCreateNestedManyWithoutVoucherInput = {
    create?: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput> | BookingCreateWithoutVoucherInput[] | BookingUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherInput | BookingCreateOrConnectWithoutVoucherInput[]
    createMany?: BookingCreateManyVoucherInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type VoucherUsageCreateNestedManyWithoutVoucherInput = {
    create?: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput> | VoucherUsageCreateWithoutVoucherInput[] | VoucherUsageUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutVoucherInput | VoucherUsageCreateOrConnectWithoutVoucherInput[]
    createMany?: VoucherUsageCreateManyVoucherInputEnvelope
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
  }

  export type BookingUncheckedCreateNestedManyWithoutVoucherInput = {
    create?: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput> | BookingCreateWithoutVoucherInput[] | BookingUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherInput | BookingCreateOrConnectWithoutVoucherInput[]
    createMany?: BookingCreateManyVoucherInputEnvelope
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
  }

  export type VoucherUsageUncheckedCreateNestedManyWithoutVoucherInput = {
    create?: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput> | VoucherUsageCreateWithoutVoucherInput[] | VoucherUsageUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutVoucherInput | VoucherUsageCreateOrConnectWithoutVoucherInput[]
    createMany?: VoucherUsageCreateManyVoucherInputEnvelope
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BookingUpdateManyWithoutVoucherNestedInput = {
    create?: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput> | BookingCreateWithoutVoucherInput[] | BookingUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherInput | BookingCreateOrConnectWithoutVoucherInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutVoucherInput | BookingUpsertWithWhereUniqueWithoutVoucherInput[]
    createMany?: BookingCreateManyVoucherInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutVoucherInput | BookingUpdateWithWhereUniqueWithoutVoucherInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutVoucherInput | BookingUpdateManyWithWhereWithoutVoucherInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type VoucherUsageUpdateManyWithoutVoucherNestedInput = {
    create?: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput> | VoucherUsageCreateWithoutVoucherInput[] | VoucherUsageUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutVoucherInput | VoucherUsageCreateOrConnectWithoutVoucherInput[]
    upsert?: VoucherUsageUpsertWithWhereUniqueWithoutVoucherInput | VoucherUsageUpsertWithWhereUniqueWithoutVoucherInput[]
    createMany?: VoucherUsageCreateManyVoucherInputEnvelope
    set?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    disconnect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    delete?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    update?: VoucherUsageUpdateWithWhereUniqueWithoutVoucherInput | VoucherUsageUpdateWithWhereUniqueWithoutVoucherInput[]
    updateMany?: VoucherUsageUpdateManyWithWhereWithoutVoucherInput | VoucherUsageUpdateManyWithWhereWithoutVoucherInput[]
    deleteMany?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
  }

  export type BookingUncheckedUpdateManyWithoutVoucherNestedInput = {
    create?: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput> | BookingCreateWithoutVoucherInput[] | BookingUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherInput | BookingCreateOrConnectWithoutVoucherInput[]
    upsert?: BookingUpsertWithWhereUniqueWithoutVoucherInput | BookingUpsertWithWhereUniqueWithoutVoucherInput[]
    createMany?: BookingCreateManyVoucherInputEnvelope
    set?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    disconnect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    delete?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    connect?: BookingWhereUniqueInput | BookingWhereUniqueInput[]
    update?: BookingUpdateWithWhereUniqueWithoutVoucherInput | BookingUpdateWithWhereUniqueWithoutVoucherInput[]
    updateMany?: BookingUpdateManyWithWhereWithoutVoucherInput | BookingUpdateManyWithWhereWithoutVoucherInput[]
    deleteMany?: BookingScalarWhereInput | BookingScalarWhereInput[]
  }

  export type VoucherUsageUncheckedUpdateManyWithoutVoucherNestedInput = {
    create?: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput> | VoucherUsageCreateWithoutVoucherInput[] | VoucherUsageUncheckedCreateWithoutVoucherInput[]
    connectOrCreate?: VoucherUsageCreateOrConnectWithoutVoucherInput | VoucherUsageCreateOrConnectWithoutVoucherInput[]
    upsert?: VoucherUsageUpsertWithWhereUniqueWithoutVoucherInput | VoucherUsageUpsertWithWhereUniqueWithoutVoucherInput[]
    createMany?: VoucherUsageCreateManyVoucherInputEnvelope
    set?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    disconnect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    delete?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    connect?: VoucherUsageWhereUniqueInput | VoucherUsageWhereUniqueInput[]
    update?: VoucherUsageUpdateWithWhereUniqueWithoutVoucherInput | VoucherUsageUpdateWithWhereUniqueWithoutVoucherInput[]
    updateMany?: VoucherUsageUpdateManyWithWhereWithoutVoucherInput | VoucherUsageUpdateManyWithWhereWithoutVoucherInput[]
    deleteMany?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
  }

  export type VoucherCreateNestedOneWithoutUsagesInput = {
    create?: XOR<VoucherCreateWithoutUsagesInput, VoucherUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: VoucherCreateOrConnectWithoutUsagesInput
    connect?: VoucherWhereUniqueInput
  }

  export type BookingCreateNestedOneWithoutVoucherUsagesInput = {
    create?: XOR<BookingCreateWithoutVoucherUsagesInput, BookingUncheckedCreateWithoutVoucherUsagesInput>
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherUsagesInput
    connect?: BookingWhereUniqueInput
  }

  export type VoucherUpdateOneRequiredWithoutUsagesNestedInput = {
    create?: XOR<VoucherCreateWithoutUsagesInput, VoucherUncheckedCreateWithoutUsagesInput>
    connectOrCreate?: VoucherCreateOrConnectWithoutUsagesInput
    upsert?: VoucherUpsertWithoutUsagesInput
    connect?: VoucherWhereUniqueInput
    update?: XOR<XOR<VoucherUpdateToOneWithWhereWithoutUsagesInput, VoucherUpdateWithoutUsagesInput>, VoucherUncheckedUpdateWithoutUsagesInput>
  }

  export type BookingUpdateOneRequiredWithoutVoucherUsagesNestedInput = {
    create?: XOR<BookingCreateWithoutVoucherUsagesInput, BookingUncheckedCreateWithoutVoucherUsagesInput>
    connectOrCreate?: BookingCreateOrConnectWithoutVoucherUsagesInput
    upsert?: BookingUpsertWithoutVoucherUsagesInput
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutVoucherUsagesInput, BookingUpdateWithoutVoucherUsagesInput>, BookingUncheckedUpdateWithoutVoucherUsagesInput>
  }

  export type BookingCreateNestedOneWithoutPassengersInput = {
    create?: XOR<BookingCreateWithoutPassengersInput, BookingUncheckedCreateWithoutPassengersInput>
    connectOrCreate?: BookingCreateOrConnectWithoutPassengersInput
    connect?: BookingWhereUniqueInput
  }

  export type BookingUpdateOneRequiredWithoutPassengersNestedInput = {
    create?: XOR<BookingCreateWithoutPassengersInput, BookingUncheckedCreateWithoutPassengersInput>
    connectOrCreate?: BookingCreateOrConnectWithoutPassengersInput
    upsert?: BookingUpsertWithoutPassengersInput
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutPassengersInput, BookingUpdateWithoutPassengersInput>, BookingUncheckedUpdateWithoutPassengersInput>
  }

  export type BookingCreateNestedOneWithoutStatusLogsInput = {
    create?: XOR<BookingCreateWithoutStatusLogsInput, BookingUncheckedCreateWithoutStatusLogsInput>
    connectOrCreate?: BookingCreateOrConnectWithoutStatusLogsInput
    connect?: BookingWhereUniqueInput
  }

  export type BookingUpdateOneRequiredWithoutStatusLogsNestedInput = {
    create?: XOR<BookingCreateWithoutStatusLogsInput, BookingUncheckedCreateWithoutStatusLogsInput>
    connectOrCreate?: BookingCreateOrConnectWithoutStatusLogsInput
    upsert?: BookingUpsertWithoutStatusLogsInput
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutStatusLogsInput, BookingUpdateWithoutStatusLogsInput>, BookingUncheckedUpdateWithoutStatusLogsInput>
  }

  export type BookingCreateNestedOneWithoutReviewInput = {
    create?: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    connectOrCreate?: BookingCreateOrConnectWithoutReviewInput
    connect?: BookingWhereUniqueInput
  }

  export type BookingUpdateOneRequiredWithoutReviewNestedInput = {
    create?: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    connectOrCreate?: BookingCreateOrConnectWithoutReviewInput
    upsert?: BookingUpsertWithoutReviewInput
    connect?: BookingWhereUniqueInput
    update?: XOR<XOR<BookingUpdateToOneWithWhereWithoutReviewInput, BookingUpdateWithoutReviewInput>, BookingUncheckedUpdateWithoutReviewInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type PassengerCreateWithoutBookingInput = {
    id?: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
  }

  export type PassengerUncheckedCreateWithoutBookingInput = {
    id?: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
  }

  export type PassengerCreateOrConnectWithoutBookingInput = {
    where: PassengerWhereUniqueInput
    create: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput>
  }

  export type PassengerCreateManyBookingInputEnvelope = {
    data: PassengerCreateManyBookingInput | PassengerCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type StatusLogCreateWithoutBookingInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
  }

  export type StatusLogUncheckedCreateWithoutBookingInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
  }

  export type StatusLogCreateOrConnectWithoutBookingInput = {
    where: StatusLogWhereUniqueInput
    create: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput>
  }

  export type StatusLogCreateManyBookingInputEnvelope = {
    data: StatusLogCreateManyBookingInput | StatusLogCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type ReviewCreateWithoutBookingInput = {
    id?: string
    userId: string
    tripId: string
    reviewerName: string
    routeName?: string
    origin?: string
    destination?: string
    rating: number
    comment?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewUncheckedCreateWithoutBookingInput = {
    id?: string
    userId: string
    tripId: string
    reviewerName: string
    routeName?: string
    origin?: string
    destination?: string
    rating: number
    comment?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReviewCreateOrConnectWithoutBookingInput = {
    where: ReviewWhereUniqueInput
    create: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
  }

  export type VoucherCreateWithoutBookingsInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: VoucherUsageCreateNestedManyWithoutVoucherInput
  }

  export type VoucherUncheckedCreateWithoutBookingsInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    usages?: VoucherUsageUncheckedCreateNestedManyWithoutVoucherInput
  }

  export type VoucherCreateOrConnectWithoutBookingsInput = {
    where: VoucherWhereUniqueInput
    create: XOR<VoucherCreateWithoutBookingsInput, VoucherUncheckedCreateWithoutBookingsInput>
  }

  export type VoucherUsageCreateWithoutBookingInput = {
    id?: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
    voucher: VoucherCreateNestedOneWithoutUsagesInput
  }

  export type VoucherUsageUncheckedCreateWithoutBookingInput = {
    id?: string
    voucherId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type VoucherUsageCreateOrConnectWithoutBookingInput = {
    where: VoucherUsageWhereUniqueInput
    create: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput>
  }

  export type VoucherUsageCreateManyBookingInputEnvelope = {
    data: VoucherUsageCreateManyBookingInput | VoucherUsageCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type PassengerUpsertWithWhereUniqueWithoutBookingInput = {
    where: PassengerWhereUniqueInput
    update: XOR<PassengerUpdateWithoutBookingInput, PassengerUncheckedUpdateWithoutBookingInput>
    create: XOR<PassengerCreateWithoutBookingInput, PassengerUncheckedCreateWithoutBookingInput>
  }

  export type PassengerUpdateWithWhereUniqueWithoutBookingInput = {
    where: PassengerWhereUniqueInput
    data: XOR<PassengerUpdateWithoutBookingInput, PassengerUncheckedUpdateWithoutBookingInput>
  }

  export type PassengerUpdateManyWithWhereWithoutBookingInput = {
    where: PassengerScalarWhereInput
    data: XOR<PassengerUpdateManyMutationInput, PassengerUncheckedUpdateManyWithoutBookingInput>
  }

  export type PassengerScalarWhereInput = {
    AND?: PassengerScalarWhereInput | PassengerScalarWhereInput[]
    OR?: PassengerScalarWhereInput[]
    NOT?: PassengerScalarWhereInput | PassengerScalarWhereInput[]
    id?: StringFilter<"Passenger"> | string
    bookingId?: StringFilter<"Passenger"> | string
    fullName?: StringFilter<"Passenger"> | string
    phone?: StringFilter<"Passenger"> | string
    email?: StringFilter<"Passenger"> | string
    idNumber?: StringNullableFilter<"Passenger"> | string | null
    seatId?: StringFilter<"Passenger"> | string
  }

  export type StatusLogUpsertWithWhereUniqueWithoutBookingInput = {
    where: StatusLogWhereUniqueInput
    update: XOR<StatusLogUpdateWithoutBookingInput, StatusLogUncheckedUpdateWithoutBookingInput>
    create: XOR<StatusLogCreateWithoutBookingInput, StatusLogUncheckedCreateWithoutBookingInput>
  }

  export type StatusLogUpdateWithWhereUniqueWithoutBookingInput = {
    where: StatusLogWhereUniqueInput
    data: XOR<StatusLogUpdateWithoutBookingInput, StatusLogUncheckedUpdateWithoutBookingInput>
  }

  export type StatusLogUpdateManyWithWhereWithoutBookingInput = {
    where: StatusLogScalarWhereInput
    data: XOR<StatusLogUpdateManyMutationInput, StatusLogUncheckedUpdateManyWithoutBookingInput>
  }

  export type StatusLogScalarWhereInput = {
    AND?: StatusLogScalarWhereInput | StatusLogScalarWhereInput[]
    OR?: StatusLogScalarWhereInput[]
    NOT?: StatusLogScalarWhereInput | StatusLogScalarWhereInput[]
    id?: StringFilter<"StatusLog"> | string
    bookingId?: StringFilter<"StatusLog"> | string
    fromStatus?: StringNullableFilter<"StatusLog"> | string | null
    toStatus?: StringFilter<"StatusLog"> | string
    createdAt?: DateTimeFilter<"StatusLog"> | Date | string
  }

  export type ReviewUpsertWithoutBookingInput = {
    update: XOR<ReviewUpdateWithoutBookingInput, ReviewUncheckedUpdateWithoutBookingInput>
    create: XOR<ReviewCreateWithoutBookingInput, ReviewUncheckedCreateWithoutBookingInput>
    where?: ReviewWhereInput
  }

  export type ReviewUpdateToOneWithWhereWithoutBookingInput = {
    where?: ReviewWhereInput
    data: XOR<ReviewUpdateWithoutBookingInput, ReviewUncheckedUpdateWithoutBookingInput>
  }

  export type ReviewUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReviewUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    reviewerName?: StringFieldUpdateOperationsInput | string
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    rating?: IntFieldUpdateOperationsInput | number
    comment?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUpsertWithoutBookingsInput = {
    update: XOR<VoucherUpdateWithoutBookingsInput, VoucherUncheckedUpdateWithoutBookingsInput>
    create: XOR<VoucherCreateWithoutBookingsInput, VoucherUncheckedCreateWithoutBookingsInput>
    where?: VoucherWhereInput
  }

  export type VoucherUpdateToOneWithWhereWithoutBookingsInput = {
    where?: VoucherWhereInput
    data: XOR<VoucherUpdateWithoutBookingsInput, VoucherUncheckedUpdateWithoutBookingsInput>
  }

  export type VoucherUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: VoucherUsageUpdateManyWithoutVoucherNestedInput
  }

  export type VoucherUncheckedUpdateWithoutBookingsInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usages?: VoucherUsageUncheckedUpdateManyWithoutVoucherNestedInput
  }

  export type VoucherUsageUpsertWithWhereUniqueWithoutBookingInput = {
    where: VoucherUsageWhereUniqueInput
    update: XOR<VoucherUsageUpdateWithoutBookingInput, VoucherUsageUncheckedUpdateWithoutBookingInput>
    create: XOR<VoucherUsageCreateWithoutBookingInput, VoucherUsageUncheckedCreateWithoutBookingInput>
  }

  export type VoucherUsageUpdateWithWhereUniqueWithoutBookingInput = {
    where: VoucherUsageWhereUniqueInput
    data: XOR<VoucherUsageUpdateWithoutBookingInput, VoucherUsageUncheckedUpdateWithoutBookingInput>
  }

  export type VoucherUsageUpdateManyWithWhereWithoutBookingInput = {
    where: VoucherUsageScalarWhereInput
    data: XOR<VoucherUsageUpdateManyMutationInput, VoucherUsageUncheckedUpdateManyWithoutBookingInput>
  }

  export type VoucherUsageScalarWhereInput = {
    AND?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
    OR?: VoucherUsageScalarWhereInput[]
    NOT?: VoucherUsageScalarWhereInput | VoucherUsageScalarWhereInput[]
    id?: StringFilter<"VoucherUsage"> | string
    voucherId?: StringFilter<"VoucherUsage"> | string
    bookingId?: StringFilter<"VoucherUsage"> | string
    userId?: StringNullableFilter<"VoucherUsage"> | string | null
    guestEmail?: StringNullableFilter<"VoucherUsage"> | string | null
    discountAmount?: FloatFilter<"VoucherUsage"> | number
    createdAt?: DateTimeFilter<"VoucherUsage"> | Date | string
  }

  export type BookingCreateWithoutVoucherInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogCreateNestedManyWithoutBookingInput
    review?: ReviewCreateNestedOneWithoutBookingInput
    voucherUsages?: VoucherUsageCreateNestedManyWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutVoucherInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerUncheckedCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogUncheckedCreateNestedManyWithoutBookingInput
    review?: ReviewUncheckedCreateNestedOneWithoutBookingInput
    voucherUsages?: VoucherUsageUncheckedCreateNestedManyWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutVoucherInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput>
  }

  export type BookingCreateManyVoucherInputEnvelope = {
    data: BookingCreateManyVoucherInput | BookingCreateManyVoucherInput[]
    skipDuplicates?: boolean
  }

  export type VoucherUsageCreateWithoutVoucherInput = {
    id?: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
    booking: BookingCreateNestedOneWithoutVoucherUsagesInput
  }

  export type VoucherUsageUncheckedCreateWithoutVoucherInput = {
    id?: string
    bookingId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type VoucherUsageCreateOrConnectWithoutVoucherInput = {
    where: VoucherUsageWhereUniqueInput
    create: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput>
  }

  export type VoucherUsageCreateManyVoucherInputEnvelope = {
    data: VoucherUsageCreateManyVoucherInput | VoucherUsageCreateManyVoucherInput[]
    skipDuplicates?: boolean
  }

  export type BookingUpsertWithWhereUniqueWithoutVoucherInput = {
    where: BookingWhereUniqueInput
    update: XOR<BookingUpdateWithoutVoucherInput, BookingUncheckedUpdateWithoutVoucherInput>
    create: XOR<BookingCreateWithoutVoucherInput, BookingUncheckedCreateWithoutVoucherInput>
  }

  export type BookingUpdateWithWhereUniqueWithoutVoucherInput = {
    where: BookingWhereUniqueInput
    data: XOR<BookingUpdateWithoutVoucherInput, BookingUncheckedUpdateWithoutVoucherInput>
  }

  export type BookingUpdateManyWithWhereWithoutVoucherInput = {
    where: BookingScalarWhereInput
    data: XOR<BookingUpdateManyMutationInput, BookingUncheckedUpdateManyWithoutVoucherInput>
  }

  export type BookingScalarWhereInput = {
    AND?: BookingScalarWhereInput | BookingScalarWhereInput[]
    OR?: BookingScalarWhereInput[]
    NOT?: BookingScalarWhereInput | BookingScalarWhereInput[]
    id?: StringFilter<"Booking"> | string
    bookingCode?: StringFilter<"Booking"> | string
    tripId?: StringFilter<"Booking"> | string
    userId?: StringNullableFilter<"Booking"> | string | null
    guestEmail?: StringFilter<"Booking"> | string
    status?: StringFilter<"Booking"> | string
    paymentStatus?: StringFilter<"Booking"> | string
    holdToken?: StringNullableFilter<"Booking"> | string | null
    ticketSubtotal?: FloatFilter<"Booking"> | number
    serviceFee?: FloatFilter<"Booking"> | number
    discountAmount?: FloatFilter<"Booking"> | number
    totalAmount?: FloatFilter<"Booking"> | number
    voucherId?: StringNullableFilter<"Booking"> | string | null
    voucherCode?: StringNullableFilter<"Booking"> | string | null
    paymentDeadline?: DateTimeNullableFilter<"Booking"> | Date | string | null
    routeName?: StringFilter<"Booking"> | string
    origin?: StringFilter<"Booking"> | string
    destination?: StringFilter<"Booking"> | string
    operatorName?: StringFilter<"Booking"> | string
    pickupPoint?: StringFilter<"Booking"> | string
    dropoffPoint?: StringFilter<"Booking"> | string
    departureTime?: StringFilter<"Booking"> | string
    busPlate?: StringFilter<"Booking"> | string
    tripType?: StringFilter<"Booking"> | string
    checkedInAt?: DateTimeNullableFilter<"Booking"> | Date | string | null
    checkedInByUserId?: StringNullableFilter<"Booking"> | string | null
    createdAt?: DateTimeFilter<"Booking"> | Date | string
    updatedAt?: DateTimeFilter<"Booking"> | Date | string
  }

  export type VoucherUsageUpsertWithWhereUniqueWithoutVoucherInput = {
    where: VoucherUsageWhereUniqueInput
    update: XOR<VoucherUsageUpdateWithoutVoucherInput, VoucherUsageUncheckedUpdateWithoutVoucherInput>
    create: XOR<VoucherUsageCreateWithoutVoucherInput, VoucherUsageUncheckedCreateWithoutVoucherInput>
  }

  export type VoucherUsageUpdateWithWhereUniqueWithoutVoucherInput = {
    where: VoucherUsageWhereUniqueInput
    data: XOR<VoucherUsageUpdateWithoutVoucherInput, VoucherUsageUncheckedUpdateWithoutVoucherInput>
  }

  export type VoucherUsageUpdateManyWithWhereWithoutVoucherInput = {
    where: VoucherUsageScalarWhereInput
    data: XOR<VoucherUsageUpdateManyMutationInput, VoucherUsageUncheckedUpdateManyWithoutVoucherInput>
  }

  export type VoucherCreateWithoutUsagesInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingCreateNestedManyWithoutVoucherInput
  }

  export type VoucherUncheckedCreateWithoutUsagesInput = {
    id?: string
    code: string
    name: string
    description?: string
    discountType: string
    discountValue: number
    maxDiscount?: number | null
    minOrderValue?: number
    startDate: Date | string
    endDate: Date | string
    usageLimit?: number | null
    usagePerUser?: number | null
    applicableRoutes?: string
    applicableBusCompanies?: string
    applicableTripTypes?: string
    requiresNewUser?: boolean
    isActive?: boolean
    usedCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    bookings?: BookingUncheckedCreateNestedManyWithoutVoucherInput
  }

  export type VoucherCreateOrConnectWithoutUsagesInput = {
    where: VoucherWhereUniqueInput
    create: XOR<VoucherCreateWithoutUsagesInput, VoucherUncheckedCreateWithoutUsagesInput>
  }

  export type BookingCreateWithoutVoucherUsagesInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogCreateNestedManyWithoutBookingInput
    review?: ReviewCreateNestedOneWithoutBookingInput
    voucher?: VoucherCreateNestedOneWithoutBookingsInput
  }

  export type BookingUncheckedCreateWithoutVoucherUsagesInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerUncheckedCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogUncheckedCreateNestedManyWithoutBookingInput
    review?: ReviewUncheckedCreateNestedOneWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutVoucherUsagesInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutVoucherUsagesInput, BookingUncheckedCreateWithoutVoucherUsagesInput>
  }

  export type VoucherUpsertWithoutUsagesInput = {
    update: XOR<VoucherUpdateWithoutUsagesInput, VoucherUncheckedUpdateWithoutUsagesInput>
    create: XOR<VoucherCreateWithoutUsagesInput, VoucherUncheckedCreateWithoutUsagesInput>
    where?: VoucherWhereInput
  }

  export type VoucherUpdateToOneWithWhereWithoutUsagesInput = {
    where?: VoucherWhereInput
    data: XOR<VoucherUpdateWithoutUsagesInput, VoucherUncheckedUpdateWithoutUsagesInput>
  }

  export type VoucherUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUpdateManyWithoutVoucherNestedInput
  }

  export type VoucherUncheckedUpdateWithoutUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    discountType?: StringFieldUpdateOperationsInput | string
    discountValue?: FloatFieldUpdateOperationsInput | number
    maxDiscount?: NullableFloatFieldUpdateOperationsInput | number | null
    minOrderValue?: FloatFieldUpdateOperationsInput | number
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    usageLimit?: NullableIntFieldUpdateOperationsInput | number | null
    usagePerUser?: NullableIntFieldUpdateOperationsInput | number | null
    applicableRoutes?: StringFieldUpdateOperationsInput | string
    applicableBusCompanies?: StringFieldUpdateOperationsInput | string
    applicableTripTypes?: StringFieldUpdateOperationsInput | string
    requiresNewUser?: BoolFieldUpdateOperationsInput | boolean
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usedCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    bookings?: BookingUncheckedUpdateManyWithoutVoucherNestedInput
  }

  export type BookingUpsertWithoutVoucherUsagesInput = {
    update: XOR<BookingUpdateWithoutVoucherUsagesInput, BookingUncheckedUpdateWithoutVoucherUsagesInput>
    create: XOR<BookingCreateWithoutVoucherUsagesInput, BookingUncheckedCreateWithoutVoucherUsagesInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutVoucherUsagesInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutVoucherUsagesInput, BookingUncheckedUpdateWithoutVoucherUsagesInput>
  }

  export type BookingUpdateWithoutVoucherUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUpdateManyWithoutBookingNestedInput
    review?: ReviewUpdateOneWithoutBookingNestedInput
    voucher?: VoucherUpdateOneWithoutBookingsNestedInput
  }

  export type BookingUncheckedUpdateWithoutVoucherUsagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUncheckedUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUncheckedUpdateManyWithoutBookingNestedInput
    review?: ReviewUncheckedUpdateOneWithoutBookingNestedInput
  }

  export type BookingCreateWithoutPassengersInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    statusLogs?: StatusLogCreateNestedManyWithoutBookingInput
    review?: ReviewCreateNestedOneWithoutBookingInput
    voucher?: VoucherCreateNestedOneWithoutBookingsInput
    voucherUsages?: VoucherUsageCreateNestedManyWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutPassengersInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    statusLogs?: StatusLogUncheckedCreateNestedManyWithoutBookingInput
    review?: ReviewUncheckedCreateNestedOneWithoutBookingInput
    voucherUsages?: VoucherUsageUncheckedCreateNestedManyWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutPassengersInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutPassengersInput, BookingUncheckedCreateWithoutPassengersInput>
  }

  export type BookingUpsertWithoutPassengersInput = {
    update: XOR<BookingUpdateWithoutPassengersInput, BookingUncheckedUpdateWithoutPassengersInput>
    create: XOR<BookingCreateWithoutPassengersInput, BookingUncheckedCreateWithoutPassengersInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutPassengersInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutPassengersInput, BookingUncheckedUpdateWithoutPassengersInput>
  }

  export type BookingUpdateWithoutPassengersInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    statusLogs?: StatusLogUpdateManyWithoutBookingNestedInput
    review?: ReviewUpdateOneWithoutBookingNestedInput
    voucher?: VoucherUpdateOneWithoutBookingsNestedInput
    voucherUsages?: VoucherUsageUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutPassengersInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    statusLogs?: StatusLogUncheckedUpdateManyWithoutBookingNestedInput
    review?: ReviewUncheckedUpdateOneWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type BookingCreateWithoutStatusLogsInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerCreateNestedManyWithoutBookingInput
    review?: ReviewCreateNestedOneWithoutBookingInput
    voucher?: VoucherCreateNestedOneWithoutBookingsInput
    voucherUsages?: VoucherUsageCreateNestedManyWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutStatusLogsInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerUncheckedCreateNestedManyWithoutBookingInput
    review?: ReviewUncheckedCreateNestedOneWithoutBookingInput
    voucherUsages?: VoucherUsageUncheckedCreateNestedManyWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutStatusLogsInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutStatusLogsInput, BookingUncheckedCreateWithoutStatusLogsInput>
  }

  export type BookingUpsertWithoutStatusLogsInput = {
    update: XOR<BookingUpdateWithoutStatusLogsInput, BookingUncheckedUpdateWithoutStatusLogsInput>
    create: XOR<BookingCreateWithoutStatusLogsInput, BookingUncheckedCreateWithoutStatusLogsInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutStatusLogsInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutStatusLogsInput, BookingUncheckedUpdateWithoutStatusLogsInput>
  }

  export type BookingUpdateWithoutStatusLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUpdateManyWithoutBookingNestedInput
    review?: ReviewUpdateOneWithoutBookingNestedInput
    voucher?: VoucherUpdateOneWithoutBookingsNestedInput
    voucherUsages?: VoucherUsageUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutStatusLogsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUncheckedUpdateManyWithoutBookingNestedInput
    review?: ReviewUncheckedUpdateOneWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type BookingCreateWithoutReviewInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogCreateNestedManyWithoutBookingInput
    voucher?: VoucherCreateNestedOneWithoutBookingsInput
    voucherUsages?: VoucherUsageCreateNestedManyWithoutBookingInput
  }

  export type BookingUncheckedCreateWithoutReviewInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherId?: string | null
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    passengers?: PassengerUncheckedCreateNestedManyWithoutBookingInput
    statusLogs?: StatusLogUncheckedCreateNestedManyWithoutBookingInput
    voucherUsages?: VoucherUsageUncheckedCreateNestedManyWithoutBookingInput
  }

  export type BookingCreateOrConnectWithoutReviewInput = {
    where: BookingWhereUniqueInput
    create: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
  }

  export type BookingUpsertWithoutReviewInput = {
    update: XOR<BookingUpdateWithoutReviewInput, BookingUncheckedUpdateWithoutReviewInput>
    create: XOR<BookingCreateWithoutReviewInput, BookingUncheckedCreateWithoutReviewInput>
    where?: BookingWhereInput
  }

  export type BookingUpdateToOneWithWhereWithoutReviewInput = {
    where?: BookingWhereInput
    data: XOR<BookingUpdateWithoutReviewInput, BookingUncheckedUpdateWithoutReviewInput>
  }

  export type BookingUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUpdateManyWithoutBookingNestedInput
    voucher?: VoucherUpdateOneWithoutBookingsNestedInput
    voucherUsages?: VoucherUsageUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutReviewInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherId?: NullableStringFieldUpdateOperationsInput | string | null
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUncheckedUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUncheckedUpdateManyWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type PassengerCreateManyBookingInput = {
    id?: string
    fullName: string
    phone: string
    email: string
    idNumber?: string | null
    seatId: string
  }

  export type StatusLogCreateManyBookingInput = {
    id?: string
    fromStatus?: string | null
    toStatus: string
    createdAt?: Date | string
  }

  export type VoucherUsageCreateManyBookingInput = {
    id?: string
    voucherId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type PassengerUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type PassengerUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type PassengerUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    idNumber?: NullableStringFieldUpdateOperationsInput | string | null
    seatId?: StringFieldUpdateOperationsInput | string
  }

  export type StatusLogUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusLogUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StatusLogUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    fromStatus?: NullableStringFieldUpdateOperationsInput | string | null
    toStatus?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    voucher?: VoucherUpdateOneRequiredWithoutUsagesNestedInput
  }

  export type VoucherUsageUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    voucherId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    voucherId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BookingCreateManyVoucherInput = {
    id?: string
    bookingCode: string
    tripId: string
    userId?: string | null
    guestEmail: string
    status?: string
    paymentStatus?: string
    holdToken?: string | null
    ticketSubtotal?: number
    serviceFee?: number
    discountAmount?: number
    totalAmount: number
    voucherCode?: string | null
    paymentDeadline?: Date | string | null
    routeName?: string
    origin?: string
    destination?: string
    operatorName?: string
    pickupPoint?: string
    dropoffPoint?: string
    departureTime?: string
    busPlate?: string
    tripType?: string
    checkedInAt?: Date | string | null
    checkedInByUserId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type VoucherUsageCreateManyVoucherInput = {
    id?: string
    bookingId: string
    userId?: string | null
    guestEmail?: string | null
    discountAmount: number
    createdAt?: Date | string
  }

  export type BookingUpdateWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUpdateManyWithoutBookingNestedInput
    review?: ReviewUpdateOneWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    passengers?: PassengerUncheckedUpdateManyWithoutBookingNestedInput
    statusLogs?: StatusLogUncheckedUpdateManyWithoutBookingNestedInput
    review?: ReviewUncheckedUpdateOneWithoutBookingNestedInput
    voucherUsages?: VoucherUsageUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type BookingUncheckedUpdateManyWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingCode?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    holdToken?: NullableStringFieldUpdateOperationsInput | string | null
    ticketSubtotal?: FloatFieldUpdateOperationsInput | number
    serviceFee?: FloatFieldUpdateOperationsInput | number
    discountAmount?: FloatFieldUpdateOperationsInput | number
    totalAmount?: FloatFieldUpdateOperationsInput | number
    voucherCode?: NullableStringFieldUpdateOperationsInput | string | null
    paymentDeadline?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    routeName?: StringFieldUpdateOperationsInput | string
    origin?: StringFieldUpdateOperationsInput | string
    destination?: StringFieldUpdateOperationsInput | string
    operatorName?: StringFieldUpdateOperationsInput | string
    pickupPoint?: StringFieldUpdateOperationsInput | string
    dropoffPoint?: StringFieldUpdateOperationsInput | string
    departureTime?: StringFieldUpdateOperationsInput | string
    busPlate?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    checkedInAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    checkedInByUserId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageUpdateWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: BookingUpdateOneRequiredWithoutVoucherUsagesNestedInput
  }

  export type VoucherUsageUncheckedUpdateWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type VoucherUsageUncheckedUpdateManyWithoutVoucherInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    guestEmail?: NullableStringFieldUpdateOperationsInput | string | null
    discountAmount?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}