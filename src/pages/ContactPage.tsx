import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import type { Route } from '@/lib/router';
import { useSeo } from '@/lib/seo';
import { useI18n } from '@/lib/i18n/index.tsx';
import { supabase } from '@/lib/supabase';
import { EASE, fadeUp, staggerContainer, staggerItem } from '@/lib/motion';

type Status = 'idle' | 'loading' | 'success' | 'error';
type FormErrors = Partial<Record<'name' | 'phone' | 'email' | 'message', string>>;
const viewportOnce = { once: true, margin: '-60px' as const };

export function ContactPage({ navigate }: { navigate: (to: Route) => void }) {
  const { t, dir } = useI18n();
  const c = t.contact;
  const reduced = useReducedMotion();

  useSeo({ title: c.metaTitle, description: c.metaDesc, path: '/contact' });

  const [values, setValues] = useState({
    name: '',
    phone: '',
    email: '',
    service: c.services[0] as string,
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const validate = (v: typeof values): FormErrors => {
    const e: FormErrors = {};
    if (!v.name.trim()) e.name = c.errors.name;
    if (!v.phone.trim()) {
      e.phone = c.errors.phone;
    } else if (!/^[+\d][\d\s()-]{5,}$/.test(v.phone.trim())) {
      e.phone = c.errors.phoneInvalid;
    }
    if (!v.email.trim()) {
      e.email = c.errors.email;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) {
      e.email = c.errors.emailInvalid;
    }
    if (!v.message.trim()) {
      e.message = c.errors.message;
    } else if (v.message.trim().length < 10) {
      e.message = c.errors.messageShort;
    }
    return e;
  };

  const update =
    (field: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus('loading');
    setErrorMsg('');

    if (!supabase) {
      setStatus('error');
      setErrorMsg(c.errorNotConnected);
      return;
    }

    try {
      const { error } = await supabase.from('contact_requests').insert({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        service: values.service,
        message: values.message.trim(),
      });
      if (error) throw error;
      setStatus('success');
      setValues({ name: '', phone: '', email: '', service: c.services[0], message: '' });
    } catch (err) {
      setStatus('error');
      setErrorMsg(
        err instanceof Error
          ? `${c.errorPrefix} ${err.message}. ${c.errorSuffix}`
          : c.errorGeneric,
      );
    }
  };

  return (
    <>
      <section className="relative overflow-hidden bg-cream pt-14 sm:pt-16">
        <div className="relative mx-auto max-w-8xl px-4 pb-8 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.h1 variants={staggerItem()} className="text-3xl font-700 leading-[1.12] text-ink sm:text-4xl lg:text-5xl">
              {c.title}
            </motion.h1>
            <motion.p variants={staggerItem()} className="mt-4 text-lg text-ink-500">{c.subtitle}</motion.p>
          </motion.div>
        </div>
      </section>

      <section className="bg-cream py-12 sm:py-14">
        <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            {/* FORM */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              transition={{ duration: reduced ? 0 : 0.6, ease: EASE }}
              className="card-highlight rounded-2xl border border-hairline bg-surface p-6 shadow-soft sm:p-8"
            >
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 className="h-14 w-14 text-emerald" />
                  <h2 className="mt-4 text-xl font-700 text-ink">{c.successTitle}</h2>
                  <p className="mt-2 max-w-sm text-ink-500">{c.successDesc}</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-cream px-5 py-3 text-sm font-600 text-emerald ring-1 ring-hairline hover:bg-emerald/5 btn-shimmer relative overflow-hidden"
                  >
                    {c.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label={c.nameLabel} error={errors.name} htmlFor="name">
                      <input id="name" type="text" value={values.name} onChange={update('name')}
                        className={inputClass(!!errors.name)} placeholder={c.namePlaceholder} autoComplete="name" />
                    </Field>
                    <Field label={c.phoneLabel} error={errors.phone} htmlFor="phone">
                      <input id="phone" type="tel" value={values.phone} onChange={update('phone')}
                        className={inputClass(!!errors.phone)} placeholder={c.phonePlaceholder} autoComplete="tel" />
                    </Field>
                    <Field label={c.emailLabel} error={errors.email} htmlFor="email">
                      <input id="email" type="email" value={values.email} onChange={update('email')}
                        className={inputClass(!!errors.email)} placeholder={c.emailPlaceholder} autoComplete="email" />
                    </Field>
                    <Field label={c.serviceLabel} htmlFor="service">
                      <select id="service" value={values.service} onChange={update('service')} className={inputClass(false)}>
                        {c.services.map((s) => (
                          <option key={s} value={s} className="bg-surface">{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="mt-5">
                    <Field label={c.messageLabel} error={errors.message} htmlFor="message">
                      <textarea id="message" rows={5} value={values.message} onChange={update('message')}
                        className={inputClass(!!errors.message)} placeholder={c.messagePlaceholder} />
                    </Field>
                  </div>

                  {status === 'error' && (
                    <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-50 p-4 text-sm text-red-700">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={status === 'loading'}
                    whileTap={reduced ? undefined : { scale: 0.95 }}
                    className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald px-6 py-3.5 text-base font-600 text-cream-50 shadow-soft disabled:opacity-70 btn-shimmer relative overflow-hidden"
                  >
                    {status === 'loading' ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> {c.sending}</>
                    ) : (
                      <><Send className="h-5 w-5" /> {c.sendButton}</>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* CONTACT INFO */}
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="space-y-4"
            >
              <motion.a
                variants={staggerItem()}
                whileHover={reduced ? undefined : { x: dir === 'rtl' ? -4 : 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                href={`tel:${t.common.phoneDial}`}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-emerald/30 card-highlight"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/8">
                  <Phone className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <div className="text-sm text-ink-500">{c.callNow}</div>
                  <div className="text-lg font-600 text-ink">{t.common.phoneNumber}</div>
                </div>
              </motion.a>

              <motion.a
                variants={staggerItem()}
                whileHover={reduced ? undefined : { x: dir === 'rtl' ? -4 : 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                href="https://wa.me/[PHONE-DIGITS-NO-PLUS]" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-emerald/30 card-highlight"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/8">
                  <MessageCircle className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <div className="text-sm text-ink-500">{c.whatsapp}</div>
                  <div className="text-lg font-600 text-ink">{c.whatsappAction}</div>
                </div>
              </motion.a>

              <motion.a
                variants={staggerItem()}
                whileHover={reduced ? undefined : { x: dir === 'rtl' ? -4 : 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                href="https://t.me/[TELEGRAM-USERNAME]" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-emerald/30 card-highlight"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/8">
                  <Send className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <div className="text-sm text-ink-500">{c.telegram}</div>
                  <div className="text-lg font-600 text-ink">{c.telegramAction}</div>
                </div>
              </motion.a>

              <motion.a
                variants={staggerItem()}
                whileHover={reduced ? undefined : { x: dir === 'rtl' ? -4 : 4 }}
                transition={{ duration: 0.4, ease: EASE }}
                href={`mailto:${t.common.contactEmail}`}
                className="flex items-center gap-4 rounded-2xl border border-hairline bg-surface p-5 shadow-card transition-colors hover:border-emerald/30 card-highlight"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald/8">
                  <Mail className="h-6 w-6 text-emerald" />
                </div>
                <div>
                  <div className="text-sm text-ink-500">{c.emailAction}</div>
                  <div className="text-lg font-600 text-ink">{t.common.contactEmail}</div>
                </div>
              </motion.a>

              <motion.div
                variants={staggerItem()}
                className="card-highlight rounded-2xl border border-hairline bg-surface p-5 shadow-card"
              >
                <div className="flex items-center gap-2 text-ink-600">
                  <MapPin className="h-5 w-5 text-emerald" />
                  <span className="font-600 text-ink">{c.serviceArea}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.serviceAreaDesc}</p>
                <div className="mt-3 flex items-center gap-2 text-ink-600">
                  <Clock className="h-5 w-5 text-emerald" />
                  <span className="font-600 text-ink">{c.hours}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{c.hoursDesc}</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-cream-50 px-4 py-3 text-base text-ink placeholder:text-ink-400/60 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald/30 ${
    hasError ? 'border-red-400 focus:border-red-400' : 'border-hairline focus:border-emerald/40'
  }`;
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-600 text-ink-600">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
