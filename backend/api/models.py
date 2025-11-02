import random
import string

from django.db import models


class Quizzes(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=100, default="No description")


class Questions(models.Model):
    question = models.CharField(max_length=80)
    quiz_id = models.ForeignKey(
        Quizzes, on_delete=models.CASCADE, related_name="questions"
    )  # related_name added


class Answer(models.Model):
    answer = models.CharField(max_length=60)
    question_id = models.ForeignKey(
        Questions, on_delete=models.CASCADE, related_name="answers"
    )  # related_name added
    is_correct = models.BooleanField(default=False)


def generate_room_code():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Room(models.Model):
    code = models.CharField(max_length=6, unique=True)
    quiz = models.ForeignKey(Quizzes, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
