import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
} from 'lucide-react';

import { useStore } from '../hooks/useStore';
import { submitChallengeProof } from '../services/store';
import { formatDate, pct } from '../utils/format';
import ProofComposer from '../components/ProofComposer';

export default function ChallengeDetailsPage() {
  const { id } = useParams();
  const { store, refresh } = useStore();

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const challenge = store.challenges.find(
    (item) => item.id === id
  );

  if (!challenge) {
    return (
      <div className="page">
        <div className="empty">
          <h2>Challenge not found</h2>

          <Link
            className="text-link"
            to="/challenges"
          >
            Back to challenges
          </Link>
        </div>
      </div>
    );
  }

  const progress = pct(
    challenge.completedSessions,
    challenge.threshold
  );

  const isComplete =
    challenge.completedSessions >= challenge.threshold;

  const handleSubmit = async (payload) => {
    if (submitting || isComplete) {
      return;
    }

    setSuccess('');
    setError('');
    setSubmitting(true);

    try {
      const result = await submitChallengeProof(
        challenge.id,
        payload
      );

      if (result === false) {
        throw new Error(
          'This session could not be completed.'
        );
      }

      refresh();

      setSuccess(
        'Proof submitted successfully! Your session has been completed. See you for your next session.'
      );
    } catch (submissionError) {
      setError(
        submissionError?.message ||
          'We could not save your proof. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const latestSession = challenge.sessions?.length
    ? challenge.sessions[challenge.sessions.length - 1]
    : null;

  const sessionAlreadyCompleted =
    latestSession?.status === 'completed';

  const proofDisabled =
    submitting ||
    isComplete ||
    sessionAlreadyCompleted;

  return (
    <div className="page detail-page">
      <Link
        className="back-link"
        to="/challenges"
      >
        <ArrowLeft size={16} />
        Challenges
      </Link>

      <div className="detail-title">
        <div>
          <h1>{challenge.title}</h1>

          <p>
            {challenge.frequency} · {challenge.durationDays}-day challenge
          </p>
        </div>

        <span
          className={`status ${challenge.status}`}
        >
          {challenge.status}
        </span>
      </div>

      <div className="progress-banner">
        <div>
          <div className="eyebrow">
            PROGRESS
          </div>

          <strong>
            {challenge.completedSessions} / {challenge.threshold} sessions
          </strong>

          <p>
            <Flame size={15} />
            {challenge.streak} session streak
          </p>
        </div>

        <div className="large-progress">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="detail-grid">
        <div>
          {isComplete ? (
            <div className="detail-card">
              <div className="eyebrow">
                CHALLENGE COMPLETE
              </div>

              <h3>
                You completed this challenge.
              </h3>

              <p>
                You reached the required number of successful sessions.
              </p>
            </div>
          ) : sessionAlreadyCompleted ? (
            <div className="detail-card">
              <div className="eyebrow">
                SESSION COMPLETED
              </div>

              <h3>
                This session is already complete.
              </h3>

              <p>
                You have already submitted proof for this scheduled
                session. Your next proof will count toward your next
                scheduled session.
              </p>
            </div>
          ) : (
            <ProofComposer
              onSubmit={handleSubmit}
              disabled={proofDisabled}
            />
          )}
        </div>

        <aside className="detail-card">
          <div className="eyebrow">
            CHALLENGE DETAILS
          </div>

          <div className="detail-field">
            <span>
              Minimum completion
            </span>

            <strong>
              {challenge.threshold} successful sessions required
            </strong>
          </div>

          <div className="detail-field">
            <span>
              Session status
            </span>

            <strong>
              {challenge.lateSessions
                ? `${challenge.lateSessions} late proof${
                    challenge.lateSessions > 1 ? 's' : ''
                  } accepted`
                : 'No late proofs yet'}
            </strong>
          </div>

          <div className="detail-field">
            <span>
              Sessions
            </span>

            <strong>
              {challenge.completedSessions} completed ·{' '}
              {challenge.lateSessions} late ·{' '}
              {challenge.missedSessions} missed
            </strong>
          </div>

          <div className="detail-field">
            <span>
              Window
            </span>

            <strong>
              {formatDate(challenge.startDate)} —{' '}
              {formatDate(challenge.endDate)}
            </strong>
          </div>
        </aside>
      </div>

      <div className="history-card">
        <div className="section-heading">
          <div>
            <div className="section-label">
              Session history
            </div>

            <p>
              Proof outcomes are stored against the challenge.
            </p>
          </div>
        </div>

        {challenge.sessions?.length ? (
          challenge.sessions
            .slice(-8)
            .reverse()
            .map((session) => (
              <div
                className="history-row"
                key={session.id}
              >
                <div>
                  <strong>
                    {formatDate(session.dueDate)}
                  </strong>

                  <span>
                    {session.proof?.text ||
                      'Session record'}
                  </span>
                </div>

                <span
                  className={`status ${session.status}`}
                >
                  {session.status}
                </span>
              </div>
            ))
        ) : (
          <div className="empty-inline">
            New sessions will appear here as you complete them.
          </div>
        )}
      </div>
    </div>
  );
}