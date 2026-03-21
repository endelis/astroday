// Multi-step onboarding quiz. Saves partial state to localStorage on each step.
// Steps 1–4: quiz questions. Step 5: birth data entry handled by BirthDataForm.
'use client';

import { useState, useEffect } from 'react';
import BirthDataForm from './BirthDataForm';

const QUIZ_STEPS = [
  {
    key: 'workType',
    question: 'What best describes your work?',
    options: ['Sales', 'Creative', 'Leadership', 'Operations', 'Independent'],
  },
  {
    key: 'focus',
    question: 'What do you most want guidance on?',
    options: ['Timing decisions', 'Communication', 'Financial moves', 'Energy'],
  },
  {
    key: 'preference',
    question: 'How do you prefer your insights?',
    options: ['Direct and brief', 'Detailed and explanatory'],
  },
  {
    key: 'goal',
    question: 'What are you working toward right now?',
    type: 'text',
    optional: true,
  },
];

const STORAGE_KEY = 'astroday_onboarding';
const TOTAL_STEPS = QUIZ_STEPS.length + 1; // +1 for birth data

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ workType: '', focus: '', preference: '', goal: '' });
  const [goalText, setGoalText] = useState('');

  // Restore partial state from localStorage on mount.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { step: s, answers: a, goalText: g } = JSON.parse(saved);
        if (s !== undefined) setStep(s);
        if (a) setAnswers(a);
        if (g) setGoalText(g);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  function saveToStorage(nextStep, nextAnswers, nextGoal) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ step: nextStep, answers: nextAnswers, goalText: nextGoal }));
    } catch { /* ignore storage errors */ }
  }

  function handleOptionSelect(key, value) {
    const nextAnswers = { ...answers, [key]: value };
    const nextStep = step + 1;
    setAnswers(nextAnswers);
    saveToStorage(nextStep, nextAnswers, goalText);
    setStep(nextStep);
  }

  function handleGoalSubmit() {
    const nextAnswers = { ...answers, goal: goalText };
    const nextStep = step + 1;
    setAnswers(nextAnswers);
    saveToStorage(nextStep, nextAnswers, goalText);
    setStep(nextStep);
  }

  const currentQuizStep = QUIZ_STEPS[step];
  const isBirthDataStep = step >= QUIZ_STEPS.length;
  const progress = Math.round(((step) / TOTAL_STEPS) * 100);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
        <p style={styles.stepCount}>{step + 1} of {TOTAL_STEPS}</p>

        {!isBirthDataStep && (
          <QuizStep
            step={currentQuizStep}
            goalText={goalText}
            onGoalChange={setGoalText}
            onSelect={(value) => handleOptionSelect(currentQuizStep.key, value)}
            onGoalSubmit={handleGoalSubmit}
          />
        )}

        {isBirthDataStep && (
          <BirthDataForm
            quizAnswers={answers}
            onComplete={() => localStorage.removeItem(STORAGE_KEY)}
          />
        )}
      </div>
    </div>
  );
}

function QuizStep({ step, goalText, onGoalChange, onSelect, onGoalSubmit }) {
  return (
    <>
      <h1 style={styles.question}>{step.question}</h1>
      {step.optional && <p style={styles.optional}>Optional — skip if you prefer.</p>}

      {step.type === 'text' ? (
        <div style={styles.textGroup}>
          <textarea
            value={goalText}
            onChange={e => onGoalChange(e.target.value)}
            style={styles.textarea}
            rows={3}
            placeholder="Share as much or as little as you like…"
          />
          <button onClick={onGoalSubmit} style={styles.continueButton}>
            {goalText.trim() ? 'Continue' : 'Skip for now'}
          </button>
        </div>
      ) : (
        <div style={styles.optionList}>
          {step.options.map(option => (
            <button key={option} onClick={() => onSelect(option)} style={styles.optionButton}>
              {option}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: 'var(--space-6)' },
  card: { width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-secondary)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: 'var(--space-8)' },
  progressBar: { height: '2px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '1px', marginBottom: 'var(--space-4)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: 'var(--gold)', borderRadius: '1px', transition: 'width var(--transition-normal)' },
  stepCount: { fontSize: 'var(--text-label)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--ls-label)', marginBottom: 'var(--space-6)' },
  question: { fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 'var(--space-6)', lineHeight: 'var(--lh-display)' },
  optional: { color: 'var(--text-muted)', fontSize: 'var(--text-small)', marginBottom: 'var(--space-4)', marginTop: '-var(--space-4)' },
  optionList: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  optionButton: { padding: 'var(--space-4)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-secondary)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', textAlign: 'left', cursor: 'pointer', backgroundColor: 'transparent', transition: 'var(--transition-fast)' },
  textGroup: { display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' },
  textarea: { padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--bg-tertiary)', border: '0.5px solid var(--border-default)', borderRadius: 'var(--radius-button)', color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', resize: 'vertical', outline: 'none' },
  continueButton: { padding: 'var(--space-3) var(--space-4)', border: '0.5px solid var(--gold)', borderRadius: 'var(--radius-button)', color: 'var(--gold)', fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', fontWeight: 500, cursor: 'pointer', backgroundColor: 'transparent', transition: 'var(--transition-fast)' },
};
