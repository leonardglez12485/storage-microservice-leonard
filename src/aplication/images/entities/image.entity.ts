import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileName: string;

  @Column()
  thumbnairURL: string;

  @Column()
  url: string;

  @Column()
  ownerId: string;

  @Column()
  dateCreated: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateImage() {
    if (!this.isImage(this.fileName)) {
      throw new Error('El archivo debe ser una imagen (jpg, jpeg, png, gif)');
    }
  }

  private isImage(fileName: string): boolean {
    const imagePattern = /\.(jpg|jpeg|png|gif)$/i;
    return imagePattern.test(fileName);
  }
}
