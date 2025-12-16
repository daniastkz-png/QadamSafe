import { userRepository } from '../repositories/user.repository';

export class UserService {
    async updateLanguage(userId: string, language: string) {
        if (!['ru', 'en', 'kk'].includes(language)) {
            throw new Error('Invalid language');
        }

        return userRepository.updateLanguage(userId, language);
    }

    async markWelcomeSeen(userId: string) {
        return userRepository.markWelcomeSeen(userId);
    }

    async getUserProfile(userId: string) {
        const user = await userRepository.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const userService = new UserService();
