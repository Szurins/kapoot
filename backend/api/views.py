from rest_framework import generics

from . import models, serializers


class QuizzesListCreateView(generics.ListCreateAPIView):
    queryset = models.Quizzes.objects.all()
    serializer_class = serializers.QuizzesSerializer


class QuestionsListCreateView(generics.ListCreateAPIView):
    serializer_class = serializers.QuestionSerializer

    def get_queryset(self):
        quiz_id = self.kwargs["quiz_id"]
        return models.Questions.objects.filter(quiz_id=quiz_id)

    def perform_create(self, serializer):
        quiz = models.Quizzes.objects.get(id=self.kwargs["quiz_id"])
        serializer.save(quiz_id=quiz)


class AnswersListCreateView(generics.ListCreateAPIView):
    serializer_class = serializers.AnswerSerializer

    def get_queryset(self):
        question_id = self.kwargs["question_id"]
        return models.Answer.objects.filter(question_id=question_id)

    def perform_create(self, serializer):
        question = models.Questions.objects.get(id=self.kwargs["question_id"])
        serializer.save(question_id=question)
