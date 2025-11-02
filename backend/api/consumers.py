import json

from channels.generic.websocket import AsyncWebsocketConsumer


class QuizRoomConsumer(AsyncWebsocketConsumer):
    # Static storage for simplicity; in production, consider DB/cache
    rooms_players = {}  # room_name -> set of player names
    rooms_answers = {}  # room_name -> { player_name: {answer_id, points} }

    async def connect(self):
        self.room_group_name = self.scope["url_route"]["kwargs"]["room_code"]

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Initialize room data if needed
        if self.room_group_name not in self.rooms_players:
            self.rooms_players[self.room_group_name] = set()
        if self.room_group_name not in self.rooms_answers:
            self.rooms_answers[self.room_group_name] = {}

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "join_room":
            player = data.get("player")
            self.rooms_players[self.room_group_name].add(player)

            # Notify all clients about player count and names
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "player_count_update",
                    "count": len(self.rooms_players[self.room_group_name]),
                    "players": list(self.rooms_players[self.room_group_name]),
                },
            )

        elif action == "answer_selected":
            player = data.get("player")
            answer_id = data.get("answer_id")
            points = data.get("points", 0)

            # Save player's answer and points
            self.rooms_answers.setdefault(self.room_group_name, {})
            self.rooms_answers[self.room_group_name][player] = {
                "answer_id": answer_id,
                "points": points,
            }

            # Check if all players have answered
            num_players = len(self.rooms_players.get(self.room_group_name, {}))
            num_answers = len(self.rooms_answers[self.room_group_name])
            if num_players > 0 and num_answers >= num_players:
                # Prepare results
                question_answers = self.scope.get("question_answers", {})  # optional
                results = {}
                for p, info in self.rooms_answers[self.room_group_name].items():
                    ans_id = info["answer_id"]
                    pts = info["points"]
                    results[p] = {"correct": answer_id, "points": pts}

                # Send results to all players
                await self.channel_layer.group_send(
                    self.room_group_name, {"type": "question_end", "results": results}
                )

        elif action == "start_quiz":
            # Optional: you can broadcast question data to all players
            question_data = data.get("question_data", {})
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "question_update", "payload": question_data},
            )
            # Reset previous answers
            self.rooms_answers[self.room_group_name] = {}

    # ---------------- Handlers for group messages ---------------- #

    async def player_count_update(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "type": "player_count",
                    "count": event["count"],
                    "players": event.get("players", []),
                }
            )
        )

    async def question_update(self, event):
        await self.send(
            text_data=json.dumps({"type": "question_update", "data": event["payload"]})
        )

    async def question_end(self, event):
        await self.send(
            text_data=json.dumps({"type": "question_end", "results": event["results"]})
        )
