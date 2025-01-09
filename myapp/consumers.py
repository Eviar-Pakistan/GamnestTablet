import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        print("WebSocket connection established.")

    async def disconnect(self, close_code):
        print("WebSocket connection closed.")

    async def receive(self, text_data):
        data = json.loads(text_data)
        print(f"Received data: {data}")

        # Process the `finalData` here
        game = data.get('game')
        teams = data.get('teams')

        # Send acknowledgment or response
        await self.send(text_data=json.dumps({
            "message": f"Game '{game}' with teams successfully received."
        }))
