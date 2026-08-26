import { AlertTriangle, Check, CircleDot, FolderKanban, X } from 'lucide-react';
import { portfolio } from '../../data/portfolio';
import type { JobMatchResult, MatchEvidence, PortfolioAction } from '../../types/assistant';

interface JobMatchCardProps {
  result: JobMatchResult;
  usedFallback?: boolean;
  onAction: (action: PortfolioAction) => void;
}

type FlexibleEvidence = MatchEvidence | string;

const normalizeEvidence = (item: FlexibleEvidence): MatchEvidence =>
  typeof item === 'string'
    ? { requirement: item, evidence: [] }
    : {
        requirement: item.requirement,
        evidence: Array.isArray(item.evidence) ? item.evidence : [],
        sourceIds: item.sourceIds,
      };

interface EvidenceListProps {
  heading: string;
  items: FlexibleEvidence[];
  tone: 'strong' | 'partial';
}

const EvidenceList = ({ heading, items, tone }: EvidenceListProps) => {
  if (!items.length) return null;
  const Icon = tone === 'strong' ? Check : CircleDot;
  const iconClass = tone === 'strong' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-300';

  return (
    <section aria-labelledby={`match-${tone}-heading`}>
      <h4
        id={`match-${tone}-heading`}
        className="mb-2 text-sm font-semibold text-gray-900 dark:text-white"
      >
        {heading}
      </h4>
      <ul className="space-y-2">
        {items.map((rawItem, index) => {
          const item = normalizeEvidence(rawItem);
          return (
            <li
              key={`${item.requirement}-${index}`}
              className="rounded-xl border border-gray-200 bg-white/80 p-3 dark:border-gray-700 dark:bg-gray-900/70"
            >
              <div className="flex items-start gap-2">
                <Icon aria-hidden="true" className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.requirement}
                  </p>
                  {item.evidence.length > 0 && (
                    <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300">
                      {item.evidence.slice(0, 2).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export const JobMatchCard = ({ result, usedFallback = false, onAction }: JobMatchCardProps) => {
  const score = Math.max(0, Math.min(100, Math.round(result.overallMatch)));
  const strongMatches = result.strongMatches as FlexibleEvidence[];
  const partialMatches = result.partialMatches as FlexibleEvidence[];

  return (
    <article className="space-y-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/70 dark:bg-blue-950/30">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Evidence-based match
          </p>
          <h3 className="mt-1 text-lg font-semibold text-gray-950 dark:text-white">
            {score}% portfolio match
          </h3>
        </div>
        {usedFallback && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" />
            Verified local analysis
          </span>
        )}
      </header>

      <div
        role="progressbar"
        aria-label="Overall portfolio match"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="h-2 overflow-hidden rounded-full bg-blue-100 dark:bg-gray-700"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
          style={{ width: `${score}%` }}
        />
      </div>

      <p className="text-sm leading-6 text-gray-700 dark:text-gray-200">{result.summary}</p>

      <EvidenceList heading="Strong matches" items={strongMatches} tone="strong" />
      <EvidenceList heading="Related or partial evidence" items={partialMatches} tone="partial" />

      {result.notFound.length > 0 && (
        <section aria-labelledby="match-not-found-heading">
          <h4
            id="match-not-found-heading"
            className="mb-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            Not found in verified data
          </h4>
          <ul className="flex flex-wrap gap-2">
            {result.notFound.map((requirement) => (
              <li
                key={requirement}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5 text-gray-500" />
                {requirement}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.relevantProjects.length > 0 && (
        <section aria-labelledby="match-projects-heading">
          <h4
            id="match-projects-heading"
            className="mb-2 text-sm font-semibold text-gray-900 dark:text-white"
          >
            Relevant projects
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.relevantProjects.map((projectReference) => {
              const project = portfolio.projects.find(
                (item) =>
                  item.id === projectReference ||
                  item.title.toLowerCase() === projectReference.toLowerCase(),
              );
              return project ? (
                <button
                  key={projectReference}
                  type="button"
                  onClick={() => onAction({ type: 'OPEN_PROJECT', target: project.id })}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-300 bg-white px-3 py-2 text-left text-xs font-medium text-blue-800 transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-blue-700 dark:bg-gray-900 dark:text-blue-200 dark:hover:bg-blue-950"
                >
                  <FolderKanban aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {project.title}
                </button>
              ) : (
                <span
                  key={projectReference}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                >
                  <FolderKanban aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {projectReference}
                </span>
              );
            })}
          </div>
        </section>
      )}

      {result.methodology && (
        <details className="text-xs text-gray-600 dark:text-gray-300">
          <summary className="cursor-pointer rounded py-1 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            How this was scored
          </summary>
          <p className="mt-2 leading-5">{result.methodology}</p>
        </details>
      )}
    </article>
  );
};

export default JobMatchCard;
