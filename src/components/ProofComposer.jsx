import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ImagePlus,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function ProofComposer({
  onSubmit,
  buttonLabel = 'Submit proof',
  disabled = false,
}) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  const input = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const choose = (event) => {
    if (disabled) {
      return;
    }

    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const removeFile = () => {
    if (disabled) {
      return;
    }

    setFile(null);
    setPreview('');

    if (input.current) {
      input.current.value = '';
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (
      disabled ||
      (!text.trim() && !file)
    ) {
      return;
    }

    await onSubmit({
      text: text.trim(),
      imageName: file?.name || null,
    });
  };

  const hasProof =
    Boolean(text.trim()) || Boolean(file);

  return (
    <form
      className="proof-card"
      onSubmit={submit}
    >
      <div className="eyebrow">
        TODAY'S PROOF
      </div>

      <h3>
        Submit proof to automatically complete this session.
      </h3>

      <textarea
        value={text}
        onChange={(event) =>
          setText(event.target.value)
        }
        placeholder="Write a short note about what you completed..."
        disabled={disabled}
      />

      <div className="upload-row">
        {preview ? (
          <div className="preview">
            <img
              src={preview}
              alt="Proof preview"
            />

            <button
              type="button"
              className="icon-button"
              onClick={removeFile}
              disabled={disabled}
              aria-label="Remove proof image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="upload-button"
            onClick={() => input.current?.click()}
            disabled={disabled}
          >
            <ImagePlus size={18} />
            Upload screenshot / photo
          </button>
        )}

        <input
          ref={input}
          hidden
          type="file"
          accept="image/*"
          onChange={choose}
          disabled={disabled}
        />
      </div>

      {file && (
        <div className="file-name">
          <CheckCircle2 size={15} />
          {file.name}
        </div>
      )}

      <button
        className="primary full"
        type="submit"
        disabled={disabled || !hasProof}
      >
        {disabled
          ? 'Session completed'
          : buttonLabel}
      </button>
    </form>
  );
}