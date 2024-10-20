import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import * as config from './firebase.config';

@Injectable()
export class FirebaseService {
  private storage: ReturnType<typeof getStorage>;

  constructor() {
    initializeApp(config.firebaseConfig);
    this.storage = getStorage();
  }

  async uploadFile(file: Express.Multer.File): Promise<any> {
    const dateTime = this.giveCurrentDateTime();
    const storageRef = ref(
      this.storage,
      `files/${file.originalname + ' ' + dateTime}`,
    );
    const metadata = { contentType: file.mimetype };
    let snapshot: import('firebase/storage').UploadTaskSnapshot;
    try {
      snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    } catch (error) {
      console.log(error);
    }

    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      message: 'file uploaded to firebase storage',
      name: file.originalname,
      type: file.mimetype,
      downloadURL: downloadURL,
    };
  }

  private giveCurrentDateTime(): string {
    const today = new Date();
    const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    return `${date} ${time}`;
  }

  async getImage(url: string): Promise<Buffer | null> {
    try {
      const storageRef = ref(this.storage, url);
      const file = storageRef;
      try {
        await getDownloadURL(file);
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          return null;
        }
        throw error;
      }

      const response = await fetch(await getDownloadURL(file));
      const fileBuffer = await response.arrayBuffer();
      return Buffer.from(fileBuffer);
    } catch (error) {
      console.error('Error retrieving image from Firebase:', error);
      return null;
    }
  }
}
