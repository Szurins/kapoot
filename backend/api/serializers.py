from rest_framework import serializers

from . import models


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Answer
        fields = "__all__"
        read_only_fields = ["question_id"]


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True, read_only=True, source="answer_set")

    class Meta:
        model = models.Questions
        fields = "__all__"
        read_only_fields = ["quiz_id"]


class QuizzesSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True, source="questions_set")

    class Meta:
        model = models.Quizzes
        fields = "__all__"
