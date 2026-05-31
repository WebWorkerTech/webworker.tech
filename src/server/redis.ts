import { createClient, type RedisClientType } from 'redis'
import { getEnv } from './env'

let client: RedisClientType | undefined
let connectPromise: Promise<RedisClientType | null> | undefined

async function connect() {
  if (client?.isOpen) return client

  const url = getEnv('REDIS_URL')
  if (!url) return null

  client = createClient({ url })
  client.on('error', (error) => {
    console.error('[redis]', error)
  })

  await client.connect()
  return client
}

export async function getRedis() {
  if (!connectPromise) {
    connectPromise = connect().catch((error) => {
      console.error('[redis] connect failed', error)
      connectPromise = undefined
      return null
    })
  }
  return connectPromise
}

export async function getJsonCache<T>(key: string): Promise<T | null> {
  const redis = await getRedis()
  if (!redis) return null

  const value = await redis.get(key)
  return value ? (JSON.parse(value) as T) : null
}

export async function setJsonCache(key: string, value: unknown, ttl = 60) {
  const redis = await getRedis()
  if (!redis) return

  await redis.set(key, JSON.stringify(value), { EX: ttl })
}

export async function deleteByPattern(pattern: string) {
  const redis = await getRedis()
  if (!redis) return

  for await (const keys of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    const keyList = Array.isArray(keys) ? keys : [keys]
    if (keyList.length > 0) {
      await redis.del(keyList)
    }
  }
}

export async function incrementFixedWindow(key: string, windowSeconds: number) {
  const redis = await getRedis()
  if (!redis) return null

  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, windowSeconds)
  }

  const ttl = await redis.ttl(key)
  return {
    count,
    resetSeconds: ttl > 0 ? ttl : windowSeconds,
  }
}
