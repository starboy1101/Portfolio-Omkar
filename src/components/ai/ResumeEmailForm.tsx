import { CheckCircle2, Loader2, Mail, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAssistant } from '../../contexts/AssistantContext';

export const ResumeEmailForm = () => {
  const {
    resumeEmailState,
    hideResumeEmail,
    sendResumeEmail,
    resetResumeEmailState,
  } = useAssistant();
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');

  const isSending = resumeEmailState.status === 'sending';
  const isSuccess = resumeEmailState.status === 'success';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendResumeEmail({ recipientEmail, recipientName, company, website });
  };

  if (isSuccess) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">Resume request accepted</h3>
            <p role="status" className="mt-1 text-sm leading-6 text-emerald-900 dark:text-emerald-200">
              {resumeEmailState.message ?? 'Check the recipient inbox shortly.'}
            </p>
          </div>
          <button
            type="button"
            onClick={hideResumeEmail}
            aria-label="Close resume email confirmation"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-emerald-900 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-100 dark:hover:bg-emerald-900"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/70 dark:bg-blue-950/30">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold text-gray-950 dark:text-white">
            <Mail aria-hidden="true" className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            Email Omkar’s resume
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
            Sent securely by the backend. Your address is used only for this request.
          </p>
        </div>
        <button
          type="button"
          onClick={hideResumeEmail}
          aria-label="Close resume email form"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-blue-900"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="resume-recipient-email" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-100">
            Recipient email <span aria-hidden="true">*</span>
          </label>
          <input
            id="resume-recipient-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={254}
            value={recipientEmail}
            onChange={(event) => {
              setRecipientEmail(event.target.value);
              if (resumeEmailState.status === 'error') resetResumeEmailState();
            }}
            aria-describedby={resumeEmailState.status === 'error' ? 'resume-email-error' : undefined}
            className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm transition-colors placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            placeholder="recruiter@company.com"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="resume-recipient-name" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-100">
              Name <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <input
              id="resume-recipient-name"
              type="text"
              autoComplete="name"
              maxLength={100}
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="resume-company" className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-100">
              Company <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <input
              id="resume-company"
              type="text"
              autoComplete="organization"
              maxLength={120}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-base text-gray-950 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="resume-website">Website</label>
          <input
            id="resume-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        {resumeEmailState.status === 'error' && (
          <p id="resume-email-error" role="alert" className="text-sm text-red-700 dark:text-red-300">
            {resumeEmailState.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSending || !recipientEmail.trim()}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-gray-900"
        >
          {isSending ? (
            <>
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Sending securely…
            </>
          ) : (
            <>
              <Mail aria-hidden="true" className="h-4 w-4" />
              Send resume
            </>
          )}
        </button>
      </form>
    </section>
  );
};

export default ResumeEmailForm;
