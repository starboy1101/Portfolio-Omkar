import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  Github,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { portfolio } from '../data/portfolio';
import { ApiError, sendContact } from '../services/aiApi';
import { trackEvent } from '../services/analytics';

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  role: string;
  subject: string;
  message: string;
  website: string;
}

type SubmissionState =
  | { status: 'idle' }
  | { status: 'error'; message: string };

const errorFields: ReadonlyArray<{
  name: Exclude<keyof ContactFormData, 'website'>;
  label: string;
}> = [
  { name: 'name', label: 'Name' },
  { name: 'email', label: 'Email' },
  { name: 'company', label: 'Company' },
  { name: 'role', label: 'Role or opportunity' },
  { name: 'subject', label: 'Subject' },
  { name: 'message', label: 'Message' },
];

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
} as const;

const inputClassName =
  'min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground shadow-sm transition placeholder:text-muted-foreground/75 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/15 aria-[invalid=true]:border-red-500 aria-[invalid=true]:ring-red-500/10';

const Contact = () => {
  const { profile } = portfolio;
  const [submission, setSubmission] = useState<SubmissionState>({ status: 'idle' });
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    mode: 'onBlur',
    defaultValues: { name: '', email: '', company: '', role: '', subject: '', message: '', website: '' },
  });

  const validationErrors = errorFields.flatMap(({ name, label }) => {
    const message = errors[name]?.message;
    return typeof message === 'string' ? [{ name, label, message }] : [];
  });

  const onSubmit = async (form: ContactFormData) => {
    setSubmission({ status: 'idle' });

    try {
      const response = await sendContact({
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        role: form.role.trim() || undefined,
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        website: form.website,
      });
      const message = response.message || 'Your message was sent successfully.';
      reset();
      try {
        window.sessionStorage.setItem('portfolio-contact-success', message);
      } catch {
        // The thank-you page has a generic fallback when session storage is unavailable.
      }
      void trackEvent('contact_submit_success');
      window.location.assign('/thank-you');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'The contact service is temporarily unavailable.';
      setSubmission({
        status: 'error',
        message: `${message} Your message was not sent; please retry or use the direct email link.`,
      });
    }
  };

  const onInvalid = () => {
    setSubmission({ status: 'idle' });
    window.setTimeout(() => errorSummaryRef.current?.focus(), 0);
  };

  return (
    <section id="contact" className="bg-surface py-20 sm:py-28" aria-labelledby="contact-heading">
      <div className="section-shell">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="section-kicker">Contact</p>
            <h2 id="contact-heading" className="section-title">
              Start a practical conversation.
            </h2>
            <p className="section-copy">
              Share the role, project, or collaboration you have in mind. Only the information needed to respond is requested.
            </p>

            <address className="mt-8 space-y-3 not-italic">
              <a
                href={`mailto:${profile.contact.email}`}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-medium text-foreground transition hover:border-brand-400"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Mail className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 break-all">{profile.contact.email}</span>
              </a>
              <a
                href={`tel:${profile.contact.phone_e164}`}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-medium text-foreground transition hover:border-brand-400"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Phone className="size-5" aria-hidden="true" />
                </span>
                {profile.contact.phone_display}
              </a>
              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-border bg-background p-3 text-sm font-medium text-foreground">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                {profile.location.city}, {profile.location.state} {profile.location.postal_code},{' '}
                {profile.location.country}
              </div>
            </address>

            <div className="mt-7 flex flex-wrap gap-2" aria-label="Social profiles">
              {profile.social_links.map((social) => {
                const Icon = socialIcons[social.id as keyof typeof socialIcons];
                if (!Icon) return null;
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-brand-400 hover:text-foreground"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {social.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="surface-card p-6 sm:p-8">
            <h3 className="text-2xl font-bold text-foreground">Send a message</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Fields marked with an asterisk are required. The form submits through the configured portfolio backend.
            </p>

            {validationErrors.length > 0 && (
              <div
                ref={errorSummaryRef}
                tabIndex={-1}
                className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 focus:outline-none focus:ring-4 focus:ring-red-500/20 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100"
                role="alert"
                aria-labelledby="contact-error-summary-title"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <h4 id="contact-error-summary-title" className="font-bold">
                      Please correct {validationErrors.length === 1 ? 'this field' : 'these fields'}
                    </h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5">
                      {validationErrors.map((error) => (
                        <li key={error.name}>
                          <a href={`#contact-${error.name}`} className="font-semibold underline underline-offset-4">
                            {error.label}: {error.message}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {submission.status === 'error' && (
              <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100" role="alert">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div>
                    <p>{submission.message}</p>
                    <a href={`mailto:${profile.contact.email}`} className="mt-2 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">
                      Email {profile.display_name} directly
                    </a>
                  </div>
                </div>
              </div>
            )}

            <form
              className="mt-7 space-y-5"
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              noValidate
              aria-busy={isSubmitting}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-sm font-semibold text-foreground">
                    Name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    required
                    autoComplete="name"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    {...register('name', {
                      required: 'Enter your name.',
                      maxLength: { value: 100, message: 'Name must be 100 characters or fewer.' },
                    })}
                  />
                  {errors.name && <p id="contact-name-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-semibold text-foreground">
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    {...register('email', {
                      required: 'Enter your email address.',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                      maxLength: { value: 254, message: 'Email must be 254 characters or fewer.' },
                    })}
                  />
                  {errors.email && <p id="contact-email-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-company" className="mb-2 block text-sm font-semibold text-foreground">Company</label>
                  <input
                    id="contact-company"
                    autoComplete="organization"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.company)}
                    aria-describedby={errors.company ? 'contact-company-error' : undefined}
                    {...register('company', { maxLength: { value: 120, message: 'Company must be 120 characters or fewer.' } })}
                  />
                  {errors.company && <p id="contact-company-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.company.message}</p>}
                </div>
                <div>
                  <label htmlFor="contact-role" className="mb-2 block text-sm font-semibold text-foreground">Role or opportunity</label>
                  <input
                    id="contact-role"
                    autoComplete="organization-title"
                    className={inputClassName}
                    aria-invalid={Boolean(errors.role)}
                    aria-describedby={errors.role ? 'contact-role-error' : undefined}
                    {...register('role', { maxLength: { value: 120, message: 'Role must be 120 characters or fewer.' } })}
                  />
                  {errors.role && <p id="contact-role-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.role.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="mb-2 block text-sm font-semibold text-foreground">Subject</label>
                <input
                  id="contact-subject"
                  className={inputClassName}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  {...register('subject', { maxLength: { value: 160, message: 'Subject must be 160 characters or fewer.' } })}
                />
                {errors.subject && <p id="contact-subject-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.subject.message}</p>}
              </div>

              <div>
                <label htmlFor="contact-message" className="mb-2 block text-sm font-semibold text-foreground">
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={6}
                  className={`${inputClassName} resize-y`}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-help contact-message-error' : 'contact-message-help'}
                  {...register('message', {
                    required: 'Enter a message.',
                    minLength: { value: 10, message: 'Please add a little more detail.' },
                    maxLength: { value: 2000, message: 'Message must be 2,000 characters or fewer.' },
                  })}
                />
                <p id="contact-message-help" className="mt-2 text-xs text-muted-foreground">Do not include confidential or sensitive information.</p>
                {errors.message && <p id="contact-message-error" role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.message.message}</p>}
              </div>

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              <button type="submit" className="button-primary w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="size-4" aria-hidden="true" />
                )}
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
