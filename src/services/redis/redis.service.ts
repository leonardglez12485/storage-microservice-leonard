import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(@Inject('IMAGE_CACHE') private readonly client: ClientProxy) {}

  // async onModuleInit() {
  //   try {
  //     await this.client.connect();
  //     console.log('Connected to Redis');
  //   } catch (err) {
  //     console.error('Error connecting to Redis', err);
  //   }
  // }

  async set(key: string, value: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.send({ cmd: 'set' }, { key, value }).subscribe({
        next: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  async get(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.client.send({ cmd: 'get' }, key).subscribe({
        next: (result) => resolve(result),
        error: (err) => reject(err),
      });
    });
  }
}
