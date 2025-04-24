import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import VoiceChannel, VoiceChannelParticipant

class VoiceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['channel_id']
        self.room_group_name = f'voice_{self.channel_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        # Get query parameters
        query_string = self.scope['query_string'].decode()
        query_params = dict(param.split('=') for param in query_string.split('&') if param)
        
        self.user_id = query_params.get('user_id', '')
        self.display_name = query_params.get('display_name', 'Anonymous')
        
        # Check if the voice channel exists
        channel_exists = await self.check_channel_exists()
        if not channel_exists:
            await self.close()
            return
            
        # Add user to participants
        await self.add_participant()
        
        await self.accept()
        
        # Notify others that user has joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_join',
                'user_id': self.user_id,
                'display_name': self.display_name
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Remove from participants
        await self.remove_participant()
        
        # Notify others that user has left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_leave',
                'user_id': self.user_id
            }
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        # Forward the message to the appropriate handler
        if message_type == 'offer':
            await self.handle_offer(data)
        elif message_type == 'answer':
            await self.handle_answer(data)
        elif message_type == 'ice_candidate':
            await self.handle_ice_candidate(data)
        elif message_type == 'mute_change':
            await self.handle_mute_change(data)

    # Handler methods
    async def handle_offer(self, data):
        target_user_id = data.get('target')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_offer',
                'offer': data.get('offer'),
                'from_user_id': self.user_id,
                'target_user_id': target_user_id
            }
        )
        
    async def handle_answer(self, data):
        target_user_id = data.get('target')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_answer',
                'answer': data.get('answer'),
                'from_user_id': self.user_id,
                'target_user_id': target_user_id
            }
        )
        
    async def handle_ice_candidate(self, data):
        target_user_id = data.get('target')
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_ice_candidate',
                'candidate': data.get('candidate'),
                'from_user_id': self.user_id,
                'target_user_id': target_user_id
            }
        )
        
    async def handle_mute_change(self, data):
        is_muted = data.get('is_muted', False)
        await self.update_participant_mute(is_muted)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'send_mute_change',
                'user_id': self.user_id,
                'is_muted': is_muted
            }
        )

    # Event handlers
    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user_id': event['user_id'],
            'display_name': event.get('display_name', 'Anonymous')
        }))
        
    async def user_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user_id': event['user_id']
        }))
    
    async def send_offer(self, event):
        if event['target_user_id'] == self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'offer',
                'offer': event['offer'],
                'from_user_id': event['from_user_id']
            }))
            
    async def send_answer(self, event):
        if event['target_user_id'] == self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'answer',
                'answer': event['answer'],
                'from_user_id': event['from_user_id']
            }))
            
    async def send_ice_candidate(self, event):
        if event['target_user_id'] == self.user_id:
            await self.send(text_data=json.dumps({
                'type': 'ice_candidate',
                'candidate': event['candidate'],
                'from_user_id': event['from_user_id']
            }))
            
    async def send_mute_change(self, event):
        await self.send(text_data=json.dumps({
            'type': 'mute_change',
            'user_id': event['user_id'],
            'is_muted': event['is_muted']
        }))

    # Database helpers
    @database_sync_to_async
    def check_channel_exists(self):
        try:
            return VoiceChannel.objects.filter(id=self.channel_id).exists()
        except:
            return False
            
    @database_sync_to_async
    def add_participant(self):
        try:
            VoiceChannelParticipant.objects.get_or_create(
                channel_id=self.channel_id,
                user_id=self.user_id,
                defaults={'display_name': self.display_name}
            )
        except Exception as e:
            print(f"Error adding participant: {e}")
            
    @database_sync_to_async
    def remove_participant(self):
        try:
            VoiceChannelParticipant.objects.filter(
                channel_id=self.channel_id,
                user_id=self.user_id
            ).delete()
        except Exception as e:
            print(f"Error removing participant: {e}")
            
    @database_sync_to_async
    def update_participant_mute(self, is_muted):
        try:
            participant = VoiceChannelParticipant.objects.get(
                channel_id=self.channel_id,
                user_id=self.user_id
            )
            participant.is_muted = is_muted
            participant.save()
        except Exception as e:
            print(f"Error updating mute status: {e}")