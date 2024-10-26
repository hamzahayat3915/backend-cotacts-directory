import { Controller, Patch } from '@nestjs/common';
import { Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('signup')
    async signUp(@Body() signUpDto: {email:string , password:string, username:string}) {
        return this.authService.register(signUpDto);
    }

    @Post('signin')
    async signIn(@Body() signInDto: {email:string, password:string}) {
        return this.authService.login(signInDto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body('email') email: string): Promise<{ message: string, resetToken: string }> {
        const resetToken = await this.authService.forgotPassword(email);
        // Send resetToken via email to the user in real scenarios
        return { message: 'Reset token sent to email (for demo purposes, here is the token)', resetToken };
    }
    @Patch('reset-password')
    async resetPassword(
        @Body('resetToken') resetToken: string,
        @Body('newPassword') newPassword: string
    ): Promise<{ message: string }> {
        await this.authService.resetPassword(resetToken, newPassword);
        return { message: 'Password successfully reset' };
    }
}
