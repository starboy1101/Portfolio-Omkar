import { getSkillId, portfolio } from '../data/portfolio';
import type {
  AssistantResponse,
  ChatRequest,
  JobMatchResult,
  MatchEvidence,
  PortfolioAction,
  SourceReference,
} from '../types/assistant';

export const DEFAULT_ASSISTANT_SUGGESTIONS = [
  'Tell me about Omkar',
  'What AI/ML projects has he built?',
  'Show his data analytics projects',
  'Explain his RAG experience',
];

const OFFLINE_LEAD =
  'The live AI is waking up, so I’m answering from Omkar’s verified portfolio data. ';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const includesAny = (value: string, terms: string[]) =>
  terms.some((term) => value.includes(normalize(term)));

const allSkills = portfolio.skill_categories.flatMap((category) => category.skills);
const socialById = (id: string) => portfolio.profile.social_links.find((social) => social.id === id);

const source = (
  type: SourceReference['type'],
  id: string,
  label?: string,
): SourceReference => ({ type, id, label });

const action = (type: PortfolioAction['type'], target?: string): PortfolioAction => ({
  type,
  ...(target ? { target } : {}),
});

const response = (
  message: string,
  sources: SourceReference[] = [],
  actions: PortfolioAction[] = [],
  suggestions: string[] = DEFAULT_ASSISTANT_SUGGESTIONS,
): AssistantResponse => ({
  message: `${OFFLINE_LEAD}${message}`,
  sources,
  actions,
  suggestions,
  grounded: true,
  fallbackUsed: true,
});

const findProject = (query: string, context?: ChatRequest['context']) => {
  if (context?.projectId) {
    const contextualProject = portfolio.projects.find((project) => project.id === context.projectId);
    if (contextualProject) return contextualProject;
  }

  const normalizedQuery = normalize(query);
  return portfolio.projects.find((project) => {
    const candidates = [project.id, project.title, ...(project.aliases ?? [])];
    return candidates.some((candidate) => normalizedQuery.includes(normalize(candidate)));
  });
};

const findSkill = (query: string, context?: ChatRequest['context']) => {
  if (context?.skillId) {
    const contextualSkill = allSkills.find(
      (skill) => getSkillId(skill.name) === getSkillId(context.skillId ?? ''),
    );
    if (contextualSkill) return contextualSkill;
  }

  const normalizedQuery = normalize(query);
  return [...allSkills]
    .sort((left, right) => right.name.length - left.name.length)
    .find((skill) => normalizedQuery.includes(normalize(skill.name)));
};

const describeEvidence = (skill: (typeof allSkills)[number]) => {
  const specificEvidence = skill.evidence.filter((item) => !item.startsWith('resume:'));
  const evidence = specificEvidence.length ? specificEvidence : skill.evidence;

  return evidence
    .map((item) => {
      const [kind, id] = item.split(':');
      if (kind === 'project') {
        const project = portfolio.projects.find((entry) => entry.id === id);
        if (!project) return undefined;
        const detail =
          project.highlights.find((highlight) =>
            normalize(highlight).includes(normalize(skill.name)),
          ) ?? project.highlights[0];
        return `${project.title}, where ${detail.charAt(0).toLowerCase()}${detail.slice(1)}`;
      }
      if (kind === 'experience') {
        const experience = portfolio.experience.find((entry) => entry.id === id);
        if (!experience) return undefined;
        const detail =
          experience.highlights.find((highlight) =>
            normalize(highlight).includes(normalize(skill.name)),
          ) ?? experience.highlights[0];
        return `${experience.title} at ${experience.employer}, where ${detail.charAt(0).toLowerCase()}${detail.slice(1)}`;
      }
      if (kind === 'resume') return 'the supplied core technical-skills list; no specific project mapping is recorded yet';
      return undefined;
    })
    .filter((item): item is string => Boolean(item));
};

const projectResponse = (
  project: (typeof portfolio.projects)[number],
  requestedTechnology?: string,
) => {
  const technologyNote = requestedTechnology
    ? ` It includes ${requestedTechnology} among its documented technologies.`
    : '';
  return response(
    `${project.title} is ${project.short_description.toLowerCase()} ${project.highlights[0]}${technologyNote}`,
    [source('project', project.id, project.title)],
    [action('OPEN_PROJECT', project.id)],
    ['Explain the architecture', 'Which skills does this demonstrate?', 'Show all projects'],
  );
};

const skillResponse = (skill: (typeof allSkills)[number]) => {
  const evidence = describeEvidence(skill);
  const evidenceText = evidence.length
    ? `Documented use includes ${evidence
        .slice(0, 3)
        .map((item) => item.replace(/\.+$/, ''))
        .join('. It also appears in ')}.`
    : 'It is listed in his supplied skills data, but no specific project mapping is recorded yet.';
  const supportingSources = skill.evidence
    .map((item) => {
      const [kind, id] = item.split(':');
      if (kind === 'project') {
        const project = portfolio.projects.find((entry) => entry.id === id);
        return project ? source('project', project.id, project.title) : undefined;
      }
      if (kind === 'experience') {
        const experience = portfolio.experience.find((entry) => entry.id === id);
        return experience ? source('experience', experience.id, experience.title) : undefined;
      }
      if (kind === 'resume') return source('resume', 'resume', 'Résumé');
      return undefined;
    })
    .filter((item): item is SourceReference => Boolean(item));

  return response(
    `${skill.name} is part of Omkar’s documented skill set. ${evidenceText}`,
    [source('skill', getSkillId(skill.name), skill.name), ...supportingSources.slice(0, 3)],
    [action('HIGHLIGHT_SKILL', getSkillId(skill.name))],
    ['Where has he used this?', 'Show his AI project', 'What are his Python skills?'],
  );
};

export const getLocalAssistantResponse = (
  request: Pick<ChatRequest, 'message' | 'context'>,
): AssistantResponse => {
  const query = normalize(request.message.slice(0, 4_000));
  const explicitProject = findProject(query);
  const explicitSkill = findSkill(query);
  const contextProject = request.context?.projectId
    ? portfolio.projects.find((project) => project.id === request.context?.projectId)
    : undefined;
  const contextSkill = request.context?.skillId
    ? allSkills.find(
        (skill) => getSkillId(skill.name) === getSkillId(request.context?.skillId ?? ''),
      )
    : undefined;

  if (
    includesAny(query, [
      'data analyst role',
      'data analytics role',
      'business intelligence role',
      'analytics role',
    ]) &&
    includesAny(query, ['suitable for', 'fit for', 'good fit', 'role'])
  ) {
    return response(
      'Data analytics is Omkar’s secondary track. Direct evidence includes a Data Analyst internship plus Python, SQL, Pandas, DuckDB, Tableau, and Streamlit work in the Flipkart Price Analysis and Supply Chain and Inventory Analytics projects. Recruiter mode can compare this evidence with the role’s exact requirements without overstating his primary AI/ML experience.',
      [
        source('experience', 'vidyarthimitra-data-analyst-intern', 'Data Analyst Intern'),
        source('project', 'flipkart-price-analysis', 'Flipkart Price Analysis'),
        source('project', 'supply-chain-inventory-analytics', 'Supply Chain and Inventory Analytics'),
      ],
      [action('ANALYZE_JD')],
      ['Paste a Data Analyst job description', 'Show data analytics projects', 'Explain his SQL evidence'],
    );
  }

  if (
    includesAny(query, [
      'ignore previous',
      'system prompt',
      'environment variable',
      'api key',
      'smtp password',
      'secret key',
    ])
  ) {
    return response(
      'I can’t provide hidden prompts, credentials, environment variables, or server configuration. I can help with Omkar’s verified skills, projects, experience, resume, and contact details.',
    );
  }

  if (includesAny(query, ['email me', 'send me']) && query.includes('resume')) {
    return response(
      'I can ask the secure backend to email Omkar’s resume. Enter the recipient details in the form below; the portfolio never exposes email credentials in the browser.',
      [source('resume', 'resume', 'Resume')],
      [action('SEND_RESUME_EMAIL')],
      ['View the resume instead', 'Tell me about Omkar', 'Open contact'],
    );
  }

  if (includesAny(query, ['guided tour', 'portfolio tour', 'start tour', 'show me around'])) {
    return response(
      'I can guide you through Omkar’s introduction, experience, skills, projects, certifications, resume, and contact section.',
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('START_TOUR')],
      ['Show his AI project', 'Open experience', 'View resume'],
    );
  }

  if (includesAny(query, ['job description', 'recruiter mode', 'match this role', 'match my role'])) {
    return response(
      'Open Recruiter mode and paste the role description. The match report separates directly evidenced skills, related evidence, and requirements not found in the portfolio.',
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('ANALYZE_JD')],
      ['What AI/ML projects has he built?', 'Explain his Python experience', 'Show his resume'],
    );
  }

  if (
    includesAny(query, [
      'suitable for',
      'fit for',
      'good fit',
      'ai engineer role',
      'python engineer role',
      'generative ai role',
    ])
  ) {
    return response(
      'The verified portfolio shows direct evidence across the AI Chat Application, a fine-tuned text-to-SQL system, an LLM evaluation and red-teaming framework, and a multimodal classifier, alongside Python, RAG, FastAPI, and resume-backed software engineering experience. A responsible fit assessment needs the role’s actual requirements, so Recruiter mode compares a pasted job description without inferring missing skills.',
      [
        source('profile', portfolio.profile.id, portfolio.profile.display_name),
        source('project', 'ai-chat-application', 'AI Chat Application'),
        source('project', 'llm-powered-sql-query-generator', 'LLM-Powered SQL Query Generator'),
        source('project', 'multimodal-image-text-classifier', 'Multimodal Image + Text Classifier'),
      ],
      [action('ANALYZE_JD')],
      ['Paste a job description', 'Explain his RAG experience', 'Show his experience'],
    );
  }

  const hasGlobalIntent = includesAny(query, [
    'contact',
    'hire',
    'reach',
    'email address',
    'get in touch',
    'experience',
    'employment',
    'job history',
    'certification',
    'oracle credential',
    'education',
    'degree',
    'university',
    'college',
    'resume',
    'cv',
    'github',
    'linkedin',
  ]);
  const asksForProject = includesAny(query, ['project', 'built', 'work sample', 'portfolio work']);
  if (!hasGlobalIntent && explicitProject) return projectResponse(explicitProject);
  if (!hasGlobalIntent && explicitSkill && !asksForProject) return skillResponse(explicitSkill);

  const isContextFollowUp = includesAny(query, [
    'this project',
    'this skill',
    'tell me more',
    'explain it',
    'its architecture',
    'what technologies',
    'where has he used this',
    'where did he use this',
    'where has omkar used',
  ]);
  if (!hasGlobalIntent && isContextFollowUp && contextProject) return projectResponse(contextProject);
  if (!hasGlobalIntent && isContextFollowUp && contextSkill) return skillResponse(contextSkill);

  if (includesAny(query, ['rag', 'retrieval augmented', 'faiss', 'sentence transformer', 'llama'])) {
    const aiProject = portfolio.projects.find((project) => project.id === 'ai-chat-application');
    if (aiProject) return projectResponse(aiProject, 'RAG, FAISS, SentenceTransformers, and Llama');
  }

  if (asksForProject) {
    const wantsAi = includesAny(query, ['ai', 'machine learning', 'generative', 'rag', 'llm']);
    const wantsData = includesAny(query, [
      'data analyst',
      'data analytics',
      'analytics',
      'business intelligence',
      'dashboard',
    ]);
    const rankedProjects = portfolio.projects
      .map((project) => ({
        project,
        score: [...project.technologies, ...project.categories].filter((value) =>
          query.includes(normalize(value)),
        ).length,
      }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score);
    const projects = rankedProjects.length
      ? rankedProjects.map(({ project }) => project)
      : wantsData
        ? portfolio.projects.filter((project) => project.categories.includes('Data Analytics'))
        : wantsAi
        ? portfolio.projects.filter((project) =>
            project.categories.some((category) =>
              ['AI/ML', 'Generative AI', 'RAG'].includes(category),
            ),
          )
        : portfolio.projects;

    if (!projects.length) {
      return response(
        'That project category is not documented in the portfolio. I can show Omkar’s verified AI, Python, frontend, and full-stack work.',
        [],
        [action('NAVIGATE', 'projects')],
      );
    }

    const names = projects.map((project) => project.title).join(', ');
    const requestedCategory = wantsData
      ? 'Data Analytics'
      : portfolio.projects
          .flatMap((project) => project.categories)
          .find((category, index, categories) =>
            categories.indexOf(category) === index && query.includes(normalize(category)),
          );
    const projectActions =
      projects.length === 1
        ? [action('OPEN_PROJECT', projects[0].id)]
        : requestedCategory
          ? [action('FILTER_PROJECTS', requestedCategory)]
          : [action('NAVIGATE', 'projects')];
    return response(
      `The strongest verified matches are ${names}. ${
        wantsData
          ? 'These projects provide direct evidence of SQL analysis, data preparation, and interactive dashboarding.'
          : wantsAi
          ? 'The AI Chat Application is the clearest direct evidence of RAG and generative-AI engineering.'
          : 'Each project card links only to demos or repositories present in the verified data.'
      }`,
      projects.map((project) => source('project', project.id, project.title)),
      projectActions,
      ['Explain the AI Chat Application', 'Show data analytics projects', 'Which project shows Python?'],
    );
  }

  if (includesAny(query, ['experience', 'worked', 'employment', 'job history'])) {
    const experienceSummary = portfolio.experience
      .map((entry) => `${entry.title} at ${entry.employer} (${entry.period_label})`)
      .join('; ');
    return response(
      `His current portfolio documents ${experienceSummary}.`,
      portfolio.experience.map((entry) => source('experience', entry.id, entry.title)),
      [action('SHOW_EXPERIENCE')],
      ['What technologies did he use?', 'Show his projects', 'How does he match an AI role?'],
    );
  }

  if (includesAny(query, ['certification', 'certified', 'oracle credential'])) {
    const certifications = portfolio.certifications
      .map((item) => `${item.title}${item.year ? ` (${item.year})` : ''}`)
      .join('; ');
    return response(
      `Omkar’s listed certifications are ${certifications}.`,
      portfolio.certifications.map((item) => source('certification', item.id, item.title)),
      [action('SHOW_CERTIFICATIONS')],
      ['Show his AI skills', 'Explain his RAG project', 'View resume'],
    );
  }

  if (includesAny(query, ['education', 'degree', 'university', 'college', 'cgpa'])) {
    const degree = portfolio.education[0];
    return response(
      `${degree.qualification} from ${degree.institution}, completed in ${degree.completion_year}, with ${degree.score}. The updated education section also lists CBSE Class XII in the Science stream and CBSE Class X at Army Public School.`,
      [source('profile', degree.id, degree.institution)],
      [action('NAVIGATE', 'about')],
      ['Tell me about Omkar', 'Show experience', 'View resume'],
    );
  }

  if (includesAny(query, ['resume', 'cv'])) {
    return response(
      'Omkar’s role-specific AI/ML and Data Analyst résumés are available to view or download. The AI/ML résumé is the primary copy used by the secure email flow.',
      [source('resume', 'resume', 'Resume')],
      [action('OPEN_RESUME')],
      ['Email me the resume', 'Summarize his experience', 'How can I contact him?'],
    );
  }

  if (includesAny(query, ['github', 'source code', 'code profile'])) {
    const github = socialById('github');
    return response(
      `${github?.label ?? 'GitHub'} is included as a verified profile link. Use the action below to open it.`,
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('OPEN_GITHUB')],
      ['Show his projects', 'Open LinkedIn', 'How can I contact him?'],
    );
  }

  if (includesAny(query, ['linkedin'])) {
    return response(
      'Omkar’s LinkedIn profile is included in the verified portfolio data. Use the action below to open it.',
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('OPEN_LINKEDIN')],
      ['Open GitHub', 'Show experience', 'How can I contact him?'],
    );
  }

  if (includesAny(query, ['contact', 'hire', 'reach', 'email address', 'get in touch'])) {
    return response(
      `The portfolio lists ${portfolio.profile.contact.email} as Omkar’s contact email and places him in ${portfolio.profile.location.city}, ${portfolio.profile.location.state}.`,
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('OPEN_CONTACT')],
      ['View his resume', 'Open LinkedIn', 'How well does he match my role?'],
    );
  }

  if (includesAny(query, ['skill', 'technology', 'python', 'backend', 'frontend', 'ai ml', 'data analyst', 'data analytics', 'sql', 'tableau', 'pandas'])) {
    const categories = portfolio.skill_categories.map((category) => category.label).join(', ');
    return response(
      `His verified skill groups are ${categories}. The strongest portfolio evidence for AI work is the AI Chat Application; Python is documented in both the resume and project data.`,
      [source('skill', 'python', 'Python'), source('project', 'ai-chat-application', 'AI Chat Application')],
      [action('NAVIGATE', 'skills')],
      ['Explain his RAG experience', 'Where has he used Python?', 'Show his projects'],
    );
  }

  if (includesAny(query, ['who is omkar', 'tell me about omkar', 'introduce omkar', 'summary of omkar', 'about omkar'])) {
    return response(
      portfolio.profile.summary,
      [source('profile', portfolio.profile.id, portfolio.profile.display_name)],
      [action('NAVIGATE', 'about')],
      ['What AI/ML projects has he built?', 'Explain his Python experience', 'View his resume'],
    );
  }

  return response(
    'That information isn’t included in Omkar’s portfolio, and local mode won’t guess. I can tell you about his verified projects, skills, experience, certifications, education, resume, or contact details.',
  );
};

interface RequirementTerm {
  label: string;
  aliases: string[];
}

const COMMON_REQUIREMENTS: RequirementTerm[] = [
  { label: 'Python', aliases: ['python'] },
  { label: 'C++', aliases: ['c++', 'cpp'] },
  { label: 'Java', aliases: ['java'] },
  { label: 'JavaScript', aliases: ['javascript'] },
  { label: 'TypeScript', aliases: ['typescript'] },
  { label: 'React.js', aliases: ['react', 'react.js'] },
  { label: 'FastAPI', aliases: ['fastapi'] },
  { label: 'Django', aliases: ['django'] },
  { label: 'Node.js', aliases: ['node', 'node.js'] },
  { label: 'REST APIs', aliases: ['rest api', 'restful'] },
  { label: 'RAG', aliases: ['rag', 'retrieval augmented generation'] },
  { label: 'Generative AI', aliases: ['generative ai', 'genai', 'gen ai'] },
  { label: 'Machine Learning', aliases: ['machine learning', 'ml engineer'] },
  { label: 'LLMs', aliases: ['llm', 'large language model'] },
  { label: 'FAISS', aliases: ['faiss'] },
  { label: 'SentenceTransformers', aliases: ['sentence transformers', 'sentencetransformers'] },
  { label: 'PostgreSQL', aliases: ['postgresql', 'postgres'] },
  { label: 'MongoDB', aliases: ['mongodb', 'mongo'] },
  { label: 'SQL', aliases: ['sql'] },
  { label: 'Supabase', aliases: ['supabase'] },
  { label: 'Google Cloud', aliases: ['google cloud', 'gcp'] },
  { label: 'AWS', aliases: ['aws', 'amazon web services'] },
  { label: 'Azure', aliases: ['azure'] },
  { label: 'Docker', aliases: ['docker', 'containerization'] },
  { label: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { label: 'LangChain', aliases: ['langchain'] },
  { label: 'PyTorch', aliases: ['pytorch'] },
  { label: 'TensorFlow', aliases: ['tensorflow'] },
  { label: 'Computer Vision', aliases: ['computer vision'] },
  { label: 'CLIP', aliases: ['clip'] },
  { label: 'QLoRA', aliases: ['qlora'] },
  { label: 'Text-to-SQL', aliases: ['text to sql', 'text-to-sql'] },
  { label: 'LLM Evaluation', aliases: ['llm evaluation'] },
  { label: 'DeepEval', aliases: ['deepeval'] },
  { label: 'LangSmith', aliases: ['langsmith'] },
  { label: 'Pandas', aliases: ['pandas'] },
  { label: 'DuckDB', aliases: ['duckdb'] },
  { label: 'Advanced SQL', aliases: ['advanced sql'] },
  { label: 'Common Table Expressions (CTEs)', aliases: ['cte', 'ctes', 'common table expression'] },
  { label: 'Window Functions', aliases: ['window function', 'window functions'] },
  { label: 'Tableau', aliases: ['tableau'] },
  { label: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { label: 'Streamlit', aliases: ['streamlit'] },
  { label: 'Advanced Excel', aliases: ['excel', 'advanced excel'] },
  { label: 'Exploratory Data Analysis (EDA)', aliases: ['exploratory data analysis', 'eda'] },
  { label: 'Statistical Analysis', aliases: ['statistical analysis'] },
  { label: 'Business Intelligence', aliases: ['business intelligence', 'bi'] },
  { label: 'Data Analytics', aliases: ['data analytics', 'data analyst'] },
];

const documentedTerms = new Set(
  [
    ...allSkills.map((skill) => skill.name),
    ...portfolio.projects.flatMap((project) => [
      ...project.technologies,
      ...project.categories,
    ]),
    ...portfolio.experience.flatMap((entry) => entry.technologies),
  ].map(normalize),
);

const DOCUMENTED_RELATIONS: Record<string, string[]> = {
  'machine learning': ['ai ml'],
  llms: ['llama'],
  sql: ['mysql', 'postgresql'],
  'google cloud': ['google cloud storage'],
};

const containsNormalizedTerm = (text: string, term: string) => {
  const normalizedText = normalize(text);
  const normalizedTerm = normalize(term);
  if (!normalizedTerm) return false;
  const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)${escaped}(?=\\s|$)`).test(normalizedText);
};

const hasDocumentedTerm = (term: RequirementTerm) =>
  [term.label, ...term.aliases].some((value) => {
    const normalizedValue = normalize(value);
    const relatedTerms = DOCUMENTED_RELATIONS[normalizedValue] ?? [];
    return (
      documentedTerms.has(normalizedValue) ||
      relatedTerms.some((related) => documentedTerms.has(related)) ||
      [...documentedTerms].some(
        (documented) =>
          documented.startsWith(`${normalizedValue} `) ||
          normalizedValue.startsWith(`${documented} `),
      )
    );
  });

const partialEvidence = new Set(['machine learning', 'llms', 'google cloud']);

const rankRelevantProjects = (normalizedDescription: string): string[] =>
  portfolio.projects
    .map((project) => {
      const matches = [...project.technologies, ...project.categories]
        .filter((technology) => normalizedDescription.includes(normalize(technology)))
        .slice(0, 4);
      return {
        project,
        matches,
        score: matches.length,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ project }) => project.id);

const toEvidence = (label: string): MatchEvidence => {
  const evidenceTerms = [
    normalize(label),
    ...(DOCUMENTED_RELATIONS[normalize(label)] ?? []),
  ];
  const skills = allSkills.filter((item) =>
    evidenceTerms.some((term) => normalize(item.name) === term),
  );
  const projectEvidence = portfolio.projects
    .filter((project) =>
      [...project.technologies, ...project.categories].some(
        (value) => evidenceTerms.some((term) => {
          const normalizedValue = normalize(value);
          return (
            normalizedValue === term ||
            normalizedValue.includes(term) ||
            term.includes(normalizedValue)
          );
        }),
      ),
    )
    .map((project) => project.id);
  const evidence = [
    ...skills.flatMap((skill) => describeEvidence(skill)),
    ...projectEvidence.map((projectId) => {
      const project = portfolio.projects.find((item) => item.id === projectId);
      return project ? `${project.title} project data` : projectId;
    }),
  ];

  return {
    requirement: label,
    evidence: [...new Set(evidence)].slice(0, 3),
    sourceIds: [
      ...skills.flatMap((skill) => skill.evidence),
      ...projectEvidence.map((projectId) => `project:${projectId}`),
    ],
  };
};

export const analyzeJobDescriptionLocally = (jobDescription: string): JobMatchResult => {
  const normalizedDescription = normalize(jobDescription.slice(0, 12_000));
  const mentioned = COMMON_REQUIREMENTS.filter((term) =>
    term.aliases.some((alias) => containsNormalizedTerm(normalizedDescription, alias)),
  );

  const strongLabels: string[] = [];
  const partialLabels: string[] = [];
  const notFound: string[] = [];

  mentioned.forEach((term) => {
    if (!hasDocumentedTerm(term)) {
      notFound.push(term.label);
    } else if (partialEvidence.has(normalize(term.label))) {
      partialLabels.push(term.label);
    } else {
      strongLabels.push(term.label);
    }
  });

  const strongMatches = strongLabels.map(toEvidence);
  const partialMatches = partialLabels.map(toEvidence);

  const total = mentioned.length;
  const overallMatch = total
    ? Math.round(((strongMatches.length + partialMatches.length * 0.5) / total) * 100)
    : 0;
  const relevantProjects = rankRelevantProjects(normalizedDescription);

  const summary = total
    ? `Local fallback found portfolio evidence for ${strongMatches.length} of ${total} recognized requirements and related evidence for ${partialMatches.length}. This is an evidence check, not a hiring prediction.`
    : 'Local fallback could not identify enough explicit technology requirements to score this description reliably. Try including the role’s required skills and tools.';

  return {
    overallMatch,
    strongMatches,
    partialMatches,
    notFound,
    relevantProjects,
    summary,
    methodology:
      'Local lexical comparison against technologies and categories in the verified portfolio data; no model inference.',
  };
};
