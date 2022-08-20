import { createParamDecorator, ExecutionContext, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';


export const GetUser = createParamDecorator(
    (data, ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest()
        const user = req.user
        if (!user) throw new InternalServerErrorException('User not found')
        if (data) {
            if(user[data])
            return user[data]
            
        }
        return user

    }
)