import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";

import QUESTIONS from "./SeverityQuestions.js";

const getSeverity = (score) => {
  if (score <= 4) return "Low";
  if (score <= 9) return "Medium";
  if (score <= 14) return "High";
  return "Critical";
};

export default function SeverityQuestionnaire({
  category,
  onComplete,
  onAssessmentComplete,
  onCancel,
}) {
  const questions =
    QUESTIONS[category] || QUESTIONS.Pothole;

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [answers, setAnswers] = useState(
    Array(questions.length).fill(null)
  );

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  // Controls questionnaire closing animation
  const [isClosingQuestionnaire, setIsClosingQuestionnaire] =
    useState(false);

  const [assessmentResult, setAssessmentResult] =
    useState(null);

  const question = questions[currentQuestion];

  const isFirstQuestion =
    currentQuestion === 0;

  const isLastQuestion =
    currentQuestion === questions.length - 1;

  // =========================
  // SELECT ANSWER
  // =========================

  const handleSelect = (score) => {
    setSelectedAnswer(score);

    setAnswers((prev) => {
      const updated = [...prev];

      updated[currentQuestion] = score;

      return updated;
    });
  };

  // =========================
  // NEXT
  // =========================

  const handleNext = () => {
    if (selectedAnswer === null) return;

    // =========================
    // GO TO NEXT QUESTION
    // =========================

    if (!isLastQuestion) {
      setCurrentQuestion(
        (prev) => prev + 1
      );

      setSelectedAnswer(
        answers[currentQuestion + 1]
      );

      return;
    }

    // ========================================
    // FINAL ANSWERS
    // ========================================

    const finalAnswers = [...answers];

    // Make sure the last selected answer
    // is included in the final array.
    finalAnswers[currentQuestion] =
      selectedAnswer;

    // ========================================
    // CALCULATE TOTAL SCORE
    // ========================================

    const totalScore =
      finalAnswers.reduce(
        (total, score) =>
          total + (score ?? 0),
        0
      );

    // ========================================
    // CALCULATE SEVERITY
    // ========================================

    const severity =
      getSeverity(totalScore);

    // ========================================
    // ASSESSMENT RESULT
    // ONLY SCORE + SEVERITY
    // ========================================

    const result = {
      score: totalScore,
      severity: severity,
    };

    console.log(
      "========================================"
    );

    console.log(
      "SEVERITY ASSESSMENT"
    );

    console.log(
      "========================================"
    );

    console.log(
      "Score:",
      result.score
    );

    console.log(
      "Severity:",
      result.severity
    );

    console.log(
      "========================================"
    );

    // Save assessment result
    setAssessmentResult(result);

    // Send score + severity to parent
    onAssessmentComplete?.(result);

    // Proceed to submission in parent ReportIssue.jsx
    onComplete?.(result);
  };

  // =========================
  // BACK
  // =========================

  const handleBack = () => {
    if (isFirstQuestion) {
      handleCancel();
      return;
    }

    const previousQuestion =
      currentQuestion - 1;

    setCurrentQuestion(
      previousQuestion
    );

    setSelectedAnswer(
      answers[previousQuestion]
    );
  };

  // =========================
  // CANCEL
  // =========================

  const handleCancel = () => {
    // Start closing animation
    setIsClosingQuestionnaire(true);

    // Wait for animation to finish
    setTimeout(() => {
      onCancel?.();
    }, 300);
  };

  return (
    <div
      className={`
        fixed inset-0 z-[9997]
        flex items-center justify-center
        bg-slate-950/55
        px-4 py-4

        ${
          isClosingQuestionnaire
            ? "animate-[fadeOut_0.3s_ease-in]"
            : "animate-[fadeIn_0.25s_ease-out]"
        }
      `}
    >
      {/* =========================================
          QUESTIONNAIRE
      ========================================== */}

      <div
        className={`
          relative
          w-full
          max-w-[450px]
          rounded-2xl
          border border-slate-200
          bg-white
          p-4
          shadow-[0_20px_60px_rgba(15,23,42,0.25)]

          ${
            isClosingQuestionnaire
              ? "animate-[questionnaireHide_0.3s_ease-in]"
              : "animate-[questionnaireShow_0.3s_ease-out]"
          }
        `}
      >
          {/* =====================================
              HEADER
          ====================================== */}

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    text-teal-600
                  "
                >
                  Severity Assessment
                </p>

                <h2
                  className="
                    mt-0.5
                    text-base
                    font-bold
                    text-slate-900
                  "
                >
                  {category}
                </h2>
              </div>

              <div
                className="
                  rounded-full
                  bg-slate-100
                  px-2.5 py-1
                  text-[10px]
                  font-semibold
                  text-slate-500
                "
              >
                {currentQuestion + 1}/
                {questions.length}
              </div>
            </div>

            {/* PROGRESS */}

            <div
              className="
                mt-3
                h-1
                w-full
                overflow-hidden
                rounded-full
                bg-slate-100
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-teal-600
                  transition-all
                  duration-300
                "
                style={{
                  width: `${
                    ((currentQuestion + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* =====================================
              QUESTION
          ====================================== */}

          <div>
            <h3
              className="
                text-[14px]
                font-bold
                leading-5
                text-slate-900
              "
            >
              {question.question}
            </h3>

            {/* OPTIONS */}

            <div className="mt-3 space-y-1.5">
              {question.options.map(
                (option) => {
                  const isSelected =
                    selectedAnswer ===
                    option.score;

                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() =>
                        handleSelect(
                          option.score
                        )
                      }
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-lg
                        border
                        px-3.5
                        py-2.5
                        text-left
                        text-[12px]
                        transition-all
                        duration-200
                        cursor-pointer

                        ${
                          isSelected
                            ? "border-teal-500 bg-teal-50 text-teal-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-slate-50"
                        }
                      `}
                    >
                      <span>
                        {option.label}
                      </span>

                      {isSelected && (
                        <FiCheck
                          className="
                            h-3.5 w-3.5
                            text-teal-600
                          "
                        />
                      )}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* =====================================
              BUTTONS
          ====================================== */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-between
            "
          >
            {/* BACK / CANCEL */}

            <button
              type="button"
              onClick={handleBack}
              className="
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3.5 py-2
                text-[11px]
                font-semibold
                text-slate-600
                transition-all
                duration-200
                hover:bg-slate-50
                cursor-pointer
              "
            >
              {isFirstQuestion
                ? "Cancel"
                : "Back"}
            </button>

            {/* NEXT / COMPLETE */}

            <button
              type="button"
              onClick={handleNext}
              disabled={
                selectedAnswer === null
              }
              className="
                rounded-lg
                bg-slate-900
                px-3.5 py-2
                text-[11px]
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-slate-800
                disabled:cursor-not-allowed
                disabled:opacity-40
                cursor-pointer
              "
            >
              {isLastQuestion
                ? "Complete Assessment"
                : "Next"}
            </button>
          </div>
        </div>

    </div>
  );
}

/* =========================================
   ANIMATIONS
========================================= */

const style = document.createElement("style");

style.innerHTML = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }

    to {
      opacity: 0;
    }
  }

  @keyframes questionnaireShow {
    from {
      opacity: 0;
      transform: translateY(-15px) scale(0.97);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes questionnaireHide {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    to {
      opacity: 0;
      transform: translateY(15px) scale(0.97);
    }
  }

  @keyframes modalShow {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes modalHide {
    from {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    to {
      opacity: 0;
      transform: translateY(10px) scale(0.96);
    }
  }
`;

if (!document.head.contains(style)) {
  document.head.appendChild(style);
}