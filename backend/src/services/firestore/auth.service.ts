import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { firestoreUserRepository, FirestoreUser } from '../../repositories/firestore/user.repository';
import { firestoreAchievementRepository } from '../../repositories/firestore/achievement.repository';

export class FirestoreAuthService {
    async register(data: {
        email: string;
        password: string;
        name?: string;
        language?: string;
    }): Promise<{ user: Omit<FirestoreUser, 'password'>; token: string }> {
        // Check if user already exists
        const existingUser = await firestoreUserRepository.findByEmail(data.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user in Firestore
        const user = await firestoreUserRepository.create({
            ...data,
            password: hashedPassword,
        });

        // Initialize user achievements
        await firestoreAchievementRepository.initializeUserAchievements(user.id);

        // Generate JWT token
        const token = this.generateToken(user);

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    async login(
        email: string,
        password: string
    ): Promise<{ user: Omit<FirestoreUser, 'password'>; token: string }> {
        // Find user
        const user = await firestoreUserRepository.findByEmail(email);
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

    async getUserById(userId: string): Promise<Omit<FirestoreUser, 'password'> | null> {
        const user = await firestoreUserRepository.findById(userId);
        if (!user) {
            return null;
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    private generateToken(user: FirestoreUser): string {
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

export const firestoreAuthService = new FirestoreAuthService();
