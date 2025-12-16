import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { config } from '../config';
import { User } from '@prisma/client';

export class AuthService {
    async register(data: {
        email: string;
        password: string;
        name?: string;
        language?: string;
    }): Promise<{ user: Omit<User, 'password'>; token: string }> {
        // Check if user already exists
        const existingUser = await userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await userRepository.create({
            ...data,
            password: hashedPassword,
        });

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async login(
        email: string,
        password: string
    ): Promise<{ user: Omit<User, 'password'>; token: string }> {
        // Find user
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
        const user = await userRepository.findById(userId);
        if (!user) {
            return null;
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private generateToken(user: User): string {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
            },
            config.jwtSecret,
            { expiresIn: '7d' }
        );
    }
}

export const authService = new AuthService();
