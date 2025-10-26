import json

from channels.generic.websocket import AsyncWebsocketConsumer


class QuizRoomConsumer(AsyncWebsocketConsumer):
    rooms_players = {}  # channel_name set per room
    rooms_answers = {}  # player_name -> answer_id per room
    rooms_host = {}  # host channel per room

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["room_code"]
        self.room_group_name = f"quiz_{self.room_code}"
        self.is_host = self.scope["query_string"].decode("utf-8") == "host=true"

        if self.room_group_name not in QuizRoomConsumer.rooms_players:
            QuizRoomConsumer.rooms_players[self.room_group_name] = set()
            QuizRoomConsumer.rooms_answers[self.room_group_name] = {}

        if self.is_host:
            QuizRoomConsumer.rooms_host[self.room_group_name] = self.channel_name
        else:
            QuizRoomConsumer.rooms_players[self.room_group_name].add(self.channel_name)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Broadcast player count excluding host
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_count_update",
                "count": len(QuizRoomConsumer.rooms_players[self.room_group_name]),
            },
        )

    async def disconnect(self, close_code):
        if self.is_host:
            QuizRoomConsumer.rooms_host.pop(self.room_group_name, None)
        else:
            QuizRoomConsumer.rooms_players[self.room_group_name].discard(
                self.channel_name
            )
            QuizRoomConsumer.rooms_answers[self.room_group_name].pop(
                self.channel_name, None
            )

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # Broadcast updated player count
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "player_count_update",
                "count": len(QuizRoomConsumer.rooms_players[self.room_group_name]),
            },
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")

        if action == "start_quiz":
            question_data = data.get("question_data")
            colors = ["red", "blue", "green", "yellow"]
            for i, ans in enumerate(question_data["answers"]):
                ans["color"] = colors[i % len(colors)]

            # Reset answers for new question
            QuizRoomConsumer.rooms_answers[self.room_group_name] = {}

            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "question_update", "payload": question_data},
            )

        elif action == "answer_selected":
            player = data.get("player")
            answer_id = data.get("answer_id")
            # save player answer
            QuizRoomConsumer.rooms_answers[self.room_group_name][player] = answer_id

            # Check if all players have answered
            num_players = len(QuizRoomConsumer.rooms_players[self.room_group_name])
            num_answers = len(QuizRoomConsumer.rooms_answers[self.room_group_name])
            if num_players > 0 and num_answers >= num_players:
                # Prepare results
                question_answers = self.scope.get(
                    "question_answers", {}
                )  # optional: map of correct answers
                results = {}
                # if question_answers exists, mark correct/incorrect
                for p, ans_id in QuizRoomConsumer.rooms_answers[
                    self.room_group_name
                ].items():
                    correct = False
                    if question_answers:
                        correct = question_answers.get(ans_id, False)
                    results[p] = correct

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "question_end",
                        "results": QuizRoomConsumer.rooms_answers[self.room_group_name],
                    },
                )

    async def player_count_update(self, event):
        await self.send(
            text_data=json.dumps({"type": "player_count", "count": event["count"]})
        )

    async def question_update(self, event):
        payload = event["payload"]
        await self.send(
            text_data=json.dumps({"type": "question_update", "data": payload})
        )

    async def question_end(self, event):
        await self.send(
            text_data=json.dumps({"type": "question_end", "results": event["results"]})
        )

    async def question_end(self, event):
        await self.send(
            text_data=json.dumps({"type": "question_end", "results": event["results"]})
        )
