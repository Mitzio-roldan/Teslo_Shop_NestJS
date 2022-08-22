import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/auth.entity';
import { Repository } from 'typeorm';


interface ConnectedClients{
    [id: string]: {
        socket: Socket,
        user: User
    }
    
}

@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async registerClient(client: Socket, userId: string){
        const user = await this.userRepository.findOneBy({id: userId})
        
        if(!user) throw new Error('User not found')
        if(!user.isActive) throw new Error('User not active')
        this.checkUsers(userId)
        
        this.connectedClients[client.id] = {
            socket: client,
            user
        }
    }

    removeClient(clientId: string){
        delete this.connectedClients[clientId]
    }

    getConnectedClients(){
        return Object.keys(this.connectedClients)
    }

    getUserName(socketId: string){
        return this.connectedClients[socketId].user.fullName
    }

    checkUsers(userId: string){
        for (const client of Object.keys(this.connectedClients)) {
            
            const user = this.connectedClients[client]
            if(user.user.id == userId){
                user.socket.disconnect()
                break
                
            }
            
            
            
        
            
        }
    }
}
