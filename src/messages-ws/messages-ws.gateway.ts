import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NewMessage } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtPayloadInterface } from '../auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  

  @WebSocketServer() wss: Server
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string
    let payload:JwtPayloadInterface
    try {
      payload = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
      
    } catch (error) {
      client.disconnect()
      return
    }
    
    
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
    
    
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload:NewMessage) {
    
    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserName(client.id),
      message: payload.message || 'no message!'
    })
    

  }


}
