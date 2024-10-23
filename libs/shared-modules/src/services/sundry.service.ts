import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SundryService {
  constructor() { }

  async generateHashPassword(plainPassword: string): Promise<string> {
    try {

      const saltRounds = 12; // You can adjust the number of salt rounds based on your security requirements

      // Generate a salt
      const salt = await bcrypt.genSalt(saltRounds);

      // Hash the password using the generated salt
      const hash = await bcrypt.hash(plainPassword, salt);

      return hash;
    } catch (error) {
      console.error('Error generating bcrypt hash:', error);
      throw error; // Handle the error according to your application's needs
    }
  }

  async generateOtpCode() {
    return Math.floor(10000 + Math.random() * 89999);
  }
}