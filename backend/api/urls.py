from django.urls import path

from . import views

urlpatterns = [
    path("quizzes/", view=views.QuizzesListCreateView.as_view()),
    path(
        "quizzes/<int:quiz_id>/questions/", view=views.QuestionsListCreateView.as_view()
    ),
    path(
        "quizzes/<int:quiz_id>/questions/<int:question_id>/answer/",
        view=views.AnswersListCreateView.as_view(),
    ),
]
