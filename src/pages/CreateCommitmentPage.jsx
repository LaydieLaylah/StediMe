import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PageHeader from '../components/PageHeader';
import { createCommitment } from '../services/store';
import { useStore } from '../hooks/useStore';

const initialForm = {
  name: '',
  target: '',
  frequency: 'Daily',
  note: '',

  customType: 'interval',
  customEvery: 1,
  customUnit: 'days',
  customWeeklySessions: 1,
};

export default function CreateCommitmentPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const nav = useNavigate();
  const { refresh } = useStore();

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setError('');
  };

  const getFrequencyLabel = () => {
    if (form.frequency !== 'Custom') {
      return form.frequency;
    }

    if (form.customType === 'interval') {
      return `Every ${form.customEvery || 1} ${form.customUnit}`;
    }

    return `${form.customWeeklySessions || 1}× per week`;
  };

  const submit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.target.trim()) {
      setError(
        'Add a name and target for your commitment.'
      );
      return;
    }

    if (form.frequency === 'Custom') {
      if (
        form.customType === 'interval' &&
        (!form.customEvery ||
          Number(form.customEvery) < 1)
      ) {
        setError(
          'Enter a valid interval for your custom commitment.'
        );
        return;
      }

      if (
        form.customType === 'weeklyFrequency' &&
        (!form.customWeeklySessions ||
          Number(form.customWeeklySessions) < 1 ||
          Number(form.customWeeklySessions) > 7)
      ) {
        setError(
          'Weekly frequency must be between 1 and 7 sessions.'
        );
        return;
      }
    }

    const commitment = {
      ...form,
      name: form.name.trim(),
      target: form.target.trim(),
      frequency: getFrequencyLabel(),
    };

    createCommitment(commitment);
    refresh();
    nav('/commitments');
  };

  return (
    <div className="page">
      <PageHeader
        title="Create commitment"
        subtitle="Build a recurring routine you can keep indefinitely."
      />

      <div className="form-layout">
        <form
          className="form-card"
          onSubmit={submit}
        >
          <label>
            Name

            <input
              value={form.name}
              onChange={(event) =>
                set('name', event.target.value)
              }
              placeholder="e.g. Read every day"
            />
          </label>

          <label>
            Target

            <input
              value={form.target}
              onChange={(event) =>
                set('target', event.target.value)
              }
              placeholder="e.g. 20 pages"
            />
          </label>

          <label>
            Frequency

            <div className="choice-grid">
              {[
                'Daily',
                'Weekly',
                'Monthly',
                'Annually',
                'Custom',
              ].map((option) => (
                <button
                  type="button"
                  className={
                    form.frequency === option
                      ? 'choice selected'
                      : 'choice'
                  }
                  key={option}
                  onClick={() =>
                    set('frequency', option)
                  }
                >
                  {option}
                </button>
              ))}
            </div>
          </label>

          {form.frequency === 'Custom' && (
            <div className="form-section">
              <label>
                Custom schedule

                <select
                  value={form.customType}
                  onChange={(event) =>
                    set(
                      'customType',
                      event.target.value
                    )
                  }
                >
                  <option value="interval">
                    Every X days, weeks or months
                  </option>

                  <option value="weeklyFrequency">
                    Multiple times per week
                  </option>
                </select>
              </label>

              {form.customType === 'interval' && (
                <div className="two-col">
                  <label>
                    Every

                    <input
                      type="number"
                      min="1"
                      value={form.customEvery}
                      onChange={(event) =>
                        set(
                          'customEvery',
                          event.target.value
                        )
                      }
                      placeholder="2"
                    />
                  </label>

                  <label>
                    Unit

                    <select
                      value={form.customUnit}
                      onChange={(event) =>
                        set(
                          'customUnit',
                          event.target.value
                        )
                      }
                    >
                      <option value="days">
                        Days
                      </option>

                      <option value="weeks">
                        Weeks
                      </option>

                      <option value="months">
                        Months
                      </option>
                    </select>
                  </label>
                </div>
              )}

              {form.customType === 'weeklyFrequency' && (
                <label>
                  Sessions per week

                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={form.customWeeklySessions}
                    onChange={(event) =>
                      set(
                        'customWeeklySessions',
                        event.target.value
                      )
                    }
                  />

                  <span className="field-hint">
                    For example: once, twice or three times
                    per week.
                  </span>
                </label>
              )}
            </div>
          )}

          <label>
            Note <span className="optional">optional</span>

            <textarea
              value={form.note}
              onChange={(event) =>
                set('note', event.target.value)
              }
              placeholder="A reminder that helps you return to the routine."
            />
          </label>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <button
            className="primary full"
            type="submit"
          >
            Create commitment
          </button>
        </form>

        <aside className="preview-card">
          <div className="eyebrow">
            PREVIEW
          </div>

          <h3>
            {form.name || 'Your commitment'}
          </h3>

          <p>
            {form.note ||
              'An ongoing recurring activity.'}
          </p>

          <div className="preview-stat">
            <span>Target</span>

            <strong>
              {form.target || '—'}
            </strong>
          </div>

          <div className="preview-stat">
            <span>Frequency</span>

            <strong>
              {getFrequencyLabel()}
            </strong>
          </div>

          <div className="preview-stat">
            <span>Status</span>

            <strong>
              Active
            </strong>
          </div>
        </aside>
      </div>
    </div>
  );
}