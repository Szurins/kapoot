from django.db import models


class Quizzes(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=100, default="No description")


class Questions(models.Model):
    question = models.CharField(max_length=40)
    quiz_id = models.ForeignKey(Quizzes, on_delete=models.CASCADE)


class Answer(models.Model):
    answer = models.CharField(max_length=20)
    question_id = models.ForeignKey(Questions, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)
