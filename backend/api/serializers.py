from rest_framework import serializers

from . import models


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Answer
        fields = ["id", "answer", "is_correct"]  # question_id is set automatically


class QuestionSerializer(serializers.ModelSerializer):
    answers = AnswerSerializer(many=True)

    class Meta:
        model = models.Questions
        fields = ["id", "question", "answers"]

    def create(self, validated_data):
        answers_data = validated_data.pop("answers")
        question = models.Questions.objects.create(**validated_data)
        for answer_data in answers_data:
            models.Answer.objects.create(question_id=question, **answer_data)
        return question


class QuizzesSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = models.Quizzes
        fields = ["id", "name", "description", "questions"]

    def create(self, validated_data):
        questions_data = validated_data.pop("questions")
        quiz = models.Quizzes.objects.create(**validated_data)
        for question_data in questions_data:
            answers_data = question_data.pop("answers")
            question = models.Questions.objects.create(quiz_id=quiz, **question_data)
            for answer_data in answers_data:
                models.Answer.objects.create(question_id=question, **answer_data)
        return quiz
