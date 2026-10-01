import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Flame,
} from 'lucide-react';

import { useStore } from '../hooks/useStore';
import { submitCommitmentCheckin } from '../services/store';
import { formatDate } from '../utils/format';
import ProofComposer from '../components/ProofComposer';

export default function CommitmentDetailsPage() {
  const { id } = useParams();
  const { store, refresh } = useStore();

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commitment = store.commitments.find(
    (item) => item.id === id
  );

  if (!commitment) {
    return (
      <div className="page">
        <div className="empty">
          <h2>Commitment not found</h2>

          <Link
            className="text-link"
            to="/commitments"
          >
            Back to commitments
          </Link>
        </div>
      </div>
    );
  }

  const latestHistory = commitment.history?.length
    ? commitment.history[commitment.history.length - 1]
    : null;

  const sessionAlreadyCompleted =
    latestHistory?.status === 'completed' ||
    latestHistory?.completed === true;

  const handleSubmit = async (payload) => {
    if (
      submitting ||
      sessionAlreadyCompleted
    ) {
      return;
    }

    setSuccess('');
    setError('');
    setSubmitting(true);

    try {
      const result = await submitCommitmentCheckin(
        commitment.id,
        payload
      );

      if (result === false) {
        throw new Error(
          'This check-in could not be completed.'
        );
      }

      refresh();

      setSuccess(
        'Check-in submitted successfully! Your session has been completed. See you when your next session is due.'
      );
    } catch (submissionError) {
      setError(
        submissionError?.message ||
          'We could not save your check-in. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page detail-page">
      <Link
        className="back-link"
        to="/commitments"
      >
        <ArrowLeft size={16} />
        Commitments
      </Link>

      <div className="detail-title">
        <div>
          <h1>{commitment.name}</h1>

          <p>
            {commitment.target} · {commitment.frequency}
          </p>
        </div>

        <span className="status active">
          active
        </span>
      </div>

      <div className="streak-banner">
        <div>
          <div className="eyebrow">
            CURRENT STREAK
          </div>

          <strong>
            {commitment.streak} sessions
          </strong>

          <p>
            <Flame size={15} />
            Best streak: {commitment.bestStreak}
          </p>
        </div>

        <div className="streak-copy">
          No end date. Keep checking in whenever the recurrence comes due.
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
          {sessionAlreadyCompleted ? (
            <div className="detail-card">
              <div className="eyebrow">
                SESSION COMPLETED
              </div>

              <h3>
                This session is already complete.
              </h3>

              <p>
                You have already submitted proof for this
                scheduled session. Your next check-in will
                count toward the next scheduled session.
              </p>
            </div>
          ) : (
            <ProofComposer
              onSubmit={handleSubmit}
              buttonLabel="Submit check-in"
              disabled={submitting}
            />
          )}
        </div>

        <aside className="detail-card">
          <div className="eyebrow">
            COMMITMENT DETAILS
          </div>

          <div className="detail-field">
            <span>
              Target
            </span>

            <strong>
              {commitment.target}
            </strong>
          </div>

          <div className="detail-field">
            <span>
              Frequency
            </span>

            <strong>
              {commitment.frequency}
            </strong>
          </div>

          <div className="detail-field">
            <span>
              Note
            </span>

            <strong>
              {commitment.note || 'No note added.'}
            </strong>
          </div>
        </aside>
      </div>

      <div className="history-card">
        <div className="section-label">
          Check-in history
        </div>

        {commitment.history?.length ? (
          commitment.history.map((historyItem, index) => (
            <div
              className="history-row"
              key={historyItem.id || index}
            >
              <div>
                <strong>
                  {formatDate(historyItem.date)}
                </strong>

                <span>
                  {historyItem.proof || 'Check-in record'}
                </span>
              </div>

              <span className="status completed">
                completed
              </span>
            </div>
          ))
        ) : (
          <div className="empty-inline">
            Your completed check-ins will appear here.
          </div>
        )}
      </div>
    </div>
  );
}