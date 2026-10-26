/**
 * Legacy TypeScript method decorator.
 * Enable "experimentalDecorators": true in tsconfig.json.
 */
export function Log(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (
    ...args: unknown[]
  ) => unknown;

  descriptor.value = function (
    this: unknown,
    ...args: unknown[]
  ): unknown {
    console.log(`[CALL] ${String(propertyKey)}`, args);

    try {
      const result = originalMethod.apply(this, args);
      console.log(`[RETURN] ${String(propertyKey)}`, result);
      return result;
    } catch (error: unknown) {
      console.error(`[ERROR] ${String(propertyKey)}`, error);
      throw error;
    }
  };
}

export function MeasureTime(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (
    ...args: unknown[]
  ) => unknown;

  descriptor.value = function (
    this: unknown,
    ...args: unknown[]
  ): unknown {
    const start = Date.now();

    try {
      return originalMethod.apply(this, args);
    } finally {
      console.log(
        `[TIME] ${String(propertyKey)}: ${Date.now() - start} ms`
      );
    }
  };
}

// Exercise 4: Reject a spell if its power is negative.
export function ValidateSpellPower(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (
    ...args: unknown[]
  ) => unknown;

  descriptor.value = function (
    this: unknown,
    ...args: unknown[]
  ): unknown {
    const spell = args[0] as { power?: number };

    if (spell && typeof spell.power === "number" && spell.power < 0) {
      console.error(
        `[REJECTED] ${String(propertyKey)}: spell power (${spell.power}) must not be negative.`
      );
      return;
    }

    return originalMethod.apply(this, args);
  };
}

// Exercise 5: Cache decorator — caches results per instance using a WeakMap + Map.
export function Cache(
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
): void {
  const originalMethod = descriptor.value as (
    ...args: unknown[]
  ) => unknown;

  // WeakMap keyed by instance, Map keyed by serialised arguments.
  const cacheStore = new WeakMap<object, Map<string, unknown>>();

  descriptor.value = function (
    this: object,
    ...args: unknown[]
  ): unknown {
    if (!cacheStore.has(this)) {
      cacheStore.set(this, new Map());
    }

    const instanceCache = cacheStore.get(this)!;
    const key = JSON.stringify(args);

    if (instanceCache.has(key)) {
      console.log(`[CACHE HIT] ${String(propertyKey)}`, key);
      return instanceCache.get(key);
    }

    const result = originalMethod.apply(this, args);
    instanceCache.set(key, result);
    console.log(`[CACHE MISS] ${String(propertyKey)}`, key);
    return result;
  };
}
