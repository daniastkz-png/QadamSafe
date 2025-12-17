import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { config } from '../config';
import { User } from '@prisma/client';
import { firebaseAuthService } from './firebase/auth.service';
import { firebaseUserService } from './firebase/user.service';
import { isFirebaseReady } from '../config/firebase.config';

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

        // Create user in PostgreSQL
        const user = await userRepository.create({
            ...data,
            password: hashedPassword,
        });

        // === FIREBASE INTEGRATION (Dual Write) ===
        if (isFirebaseReady()) {
            try {
                // Create user in Firebase Auth
                const firebaseUser = await firebaseAuthService.createUser(data.email, data.password);
                console.log(`✅ Firebase Auth user created: ${firebaseUser.uid}`);

                // Create user profile in Firestore
                await firebaseUserService.createUserProfile(firebaseUser.uid, {
                    postgresId: user.id,
                    email: user.email,
                    name: user.name || '',
                    rank: user.rank,
                    securityScore: user.securityScore,
                    subscriptionTier: user.subscriptionTier,
                    language: user.language,
                });
                console.log(`✅ Firestore user profile created for: ${user.email}`);
            } catch (firebaseError) {
                console.error('⚠️  Firebase user creation failed (PostgreSQL user was created):', firebaseError);
                // Continue without Firebase - user is already in PostgreSQL
            }
        } else {
            console.log('ℹ️  Firebase not configured - user created only in PostgreSQL');
        }

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

        // === FIREBASE SYNC (Update profile on login) ===
        if (isFirebaseReady()) {
            try {
                // Try to sync user data to Firestore on login
                // This ensures data consistency
                const firebaseUser = await firebaseAuthService.getUserByEmail(email);
                if (firebaseUser) {
                    await firebaseUserService.updateUserProfile(firebaseUser.uid, {
                        rank: user.rank,
                        securityScore: user.securityScore,
                        subscriptionTier: user.subscriptionTier,
                        language: user.language,
                        lastLoginAt: new Date(),
                    });
                    console.log(`✅ Firestore profile synced for: ${email}`);
                }
            } catch (firebaseError) {
                // Silently fail - sync is optional
                console.log('ℹ️  Firebase sync skipped:', (firebaseError as Error).message);
            }
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
