import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './auth.entity/auth.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(createUserDto: {email:string , password:string, username:string, court:string, branch:string}): Promise<UserEntity> {
        const user = this.userRepository.create( createUserDto );
        return this.userRepository.save(user);
    }

    async login(loginUserDto: {email:string, password:string}): Promise<{ accessToken: string , email:string, id:string}> {
        const { email, password } = loginUserDto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && await bcrypt.compare(password, user.password)) {
            const payload = { email: user.email, sub: user.id };
            const accessToken = this.jwtService.sign(payload);
            return { accessToken, email:user.email, id: String(user.id) };
        }
        throw new Error('Invalid credentials');
    }

    async forgotPassword(email: string): Promise<string> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        // Create a reset token
        const resetToken = this.jwtService.sign({ email: user.email, sub: user.id }, { expiresIn: '1h' });
        // Normally, you would send this reset token via email. For now, return it.
        return resetToken;
    }
    async editProfile(userId: string, editProfileDto: { email: string, password: string, username: string, court: string, branch: string }): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update only provided fields
        user.email = editProfileDto.email || user.email;
        user.username = editProfileDto.username || user.username;
        user.court = editProfileDto.court || user.court;
        user.branch = editProfileDto.branch || user.branch;

        // Hash password if it is provided
        if (editProfileDto.password) {
            user.password = await bcrypt.hash(editProfileDto.password, 10);
        }

        return this.userRepository.save(user);
    }
    async getUserById(userId: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id: Number(userId) } });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        console.log(user);
        return user;
    }
     // New method to handle resetting the password
     async resetPassword(resetToken: string, newPassword: string): Promise<void> {
        try {
            // Verify the reset token
            const { email } = this.jwtService.verify(resetToken);
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new NotFoundException('Invalid token');
            }
            // Update the user's password
            user.password = await bcrypt.hash(newPassword, 10);
            await this.userRepository.save(user);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async sendTemporaryPassword(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Generate a temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');

        // Hash the temporary password and save it in the database
        user.password = await bcrypt.hash(tempPassword, 10);
        await this.userRepository.save(user);

        // Send the temporary password via email
        await this.sendPasswordEmail(email, tempPassword);
    }

    private async sendPasswordEmail(email: string, tempPassword: string): Promise<void> {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // You can use another email provider
            auth: {
                user: this.configService.get<string>('EMAIL'),
                pass: this.configService.get<string>('EMAIL_PASS'),
            },
        });

        const mailOptions = {
            from: this.configService.get<string>('EMAIL'), // Replace with your email
            to: email,
            subject: 'Temporary Password for Your Account',
            text: `Here is your temporary password: ${tempPassword}. Please log in and change your password as soon as possible.`
        };

        await transporter.sendMail(mailOptions);
    }
}
