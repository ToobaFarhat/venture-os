import { IAIProvider, AIMessage, AIGenerateOptions, AIGenerateResult } from './ai.interface';

export class MockAIProvider implements IAIProvider {
  public name = 'mock-ai-engine';

  public async generate(messages: AIMessage[], options: AIGenerateOptions): Promise<AIGenerateResult> {
    const startTime = Date.now();
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const module = options.module || 'general';

    let content = '';
    let parsedJson: any = null;
    let toolCalls: any = undefined;

    // Module-specific realistic structured mock responses
    if (module === 'lead_scoring') {
      parsedJson = {
        score: Math.floor(75 + Math.random() * 20),
        risk: 'low',
        reasons: [
          'High match with target enterprise buyer persona',
          'Active engagement across initial outreach touchpoints',
          'Budget alignment matches typical won deals in this industry',
        ],
        recommendedAction: 'Schedule an executive discovery demo within 24 hours and share ROI one-pager.',
        confidence: 0.89,
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'sales_assistant') {
      const prospectMatch = messages[1]?.content?.match(/Lead:\s*([^\n]+)/);
      const leadName = prospectMatch ? prospectMatch[1] : 'Prospect';
      const companyMatch = messages[1]?.content?.match(/at\s+([^\n]+)/);
      const companyName = companyMatch ? companyMatch[1] : 'your company';

      parsedJson = {
        summary: `Strong commercial fit for enterprise operations. High conversion propensity given ${companyName}'s growth profile and unified workflow requirements.`,
        nextBestAction: 'Schedule an executive discovery walkthrough and provide tailored ROI modeling.',
        pitch: `Subject: Accelerating ${companyName}'s operational velocity with VentureOS\n\nHi ${leadName},\n\nI noticed your focus on scaling operations and eliminating disconnected business tools across your teams.\n\nVentureOS connects your CRM pipeline, project execution, and financial forecasting into a single operational cockpit—preventing revenue leaks and reducing manual coordination by over 40%.\n\nAre you open to a brief 15-minute briefing this Thursday to see how peers in your space streamlined their stack?\n\nBest regards,\nVentureOS Growth Team`,
        emailDraft: `Subject: Accelerating ${companyName}'s operational velocity with VentureOS\n\nHi ${leadName},\n\nI noticed your focus on scaling operations and eliminating disconnected business tools across your teams.\n\nVentureOS connects your CRM pipeline, project execution, and financial forecasting into a single operational cockpit—preventing revenue leaks and reducing manual coordination by over 40%.\n\nAre you open to a brief 15-minute briefing this Thursday to see how peers in your space streamlined their stack?\n\nBest regards,\nVentureOS Growth Team`,
        discoveryQuestions: [
          `What is ${companyName}'s biggest bottleneck in tracking deal conversions across sales and delivery?`,
          'How does your leadership team currently identify at-risk accounts before churn occurs?',
          'What operational KPIs are you prioritizing over the next two fiscal quarters?'
        ],
        objectionHandling: [
          {
            objection: 'We already have multiple specialized SaaS tools deployed.',
            rebuttal: 'VentureOS operates alongside or replaces fragmented point tools, syncing unified intelligence without disrupting current daily workflows.'
          },
          {
            objection: 'Our team does not have bandwidth for a complicated software rollout.',
            rebuttal: 'Our guided workspace onboarding and automated data ingestion achieve full team productivity in under 48 hours.'
          }
        ]
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'customer_churn') {
      parsedJson = {
        churnRisk: 'medium',
        healthScore: 74,
        sentiment: 'neutral',
        reasons: [
          'Support ticket response time exceeded 24 hours last week',
          'Slight drop in daily active sessions over the past 14 days',
        ],
        recommendedAction: 'Initiate proactive Customer Success check-in and provide dedicated onboarding review.',
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'feedback_analysis') {
      const lower = lastUserMessage.toLowerCase();
      const hasRating1or2 = lower.includes('1 out of 5') || lower.includes('2 out of 5') || lower.includes('rating: 1') || lower.includes('rating: 2');
      const negativeWords = [
        'slow', 'expensive', 'bad', 'issue', 'bug', 'fail', 'failure', 'block', 'delay', 'broken',
        'error', 'terrible', 'horrible', 'crash', 'frustrat', 'poor', 'complaint', 'cancel',
        'unacceptable', 'down', 'outage', 'disappoint', 'problem', 'hate', 'worst', 'critical'
      ];
      const isNegative = hasRating1or2 || negativeWords.some((w) => lower.includes(w));
      const isPricing = lower.includes('price') || lower.includes('cost') || lower.includes('expensive') || lower.includes('fee');
      const isSupport = lower.includes('support') || lower.includes('ticket') || lower.includes('response') || lower.includes('service') || lower.includes('help');

      parsedJson = {
        sentiment: isNegative ? 'negative' : 'positive',
        sentimentScore: isNegative ? -0.85 : 0.85,
        topic: isPricing ? 'pricing' : isSupport ? 'support' : isNegative ? 'support' : 'product',
        urgency: isNegative ? 'high' : 'low',
        suggestedAction: isNegative
          ? 'Reach out within 1 business day with dedicated support remediation and executive review.'
          : 'Thank the customer and request a brief public case study testimonial.',
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'project_planner') {
      parsedJson = {
        projectName: 'Strategic Operations Rollout',
        description: 'Comprehensive milestone plan generated from strategic business objective.',
        milestones: [
          { title: 'Discovery & Requirements Gathering', targetDays: 7 },
          { title: 'Core Implementation & System Integration', targetDays: 21 },
          { title: 'Quality Assurance & Stakeholder Sign-Off', targetDays: 30 },
        ],
        tasks: [
          { title: 'Audit existing workflow bottlenecks', milestoneIndex: 0, priority: 'high', estimatedHours: 12 },
          { title: 'Configure multi-workspace data models', milestoneIndex: 1, priority: 'urgent', estimatedHours: 24 },
          { title: 'Deploy cross-module automated triggers', milestoneIndex: 1, priority: 'medium', estimatedHours: 16 },
          { title: 'Conduct end-to-end user acceptance testing', milestoneIndex: 2, priority: 'high', estimatedHours: 10 },
        ],
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'meeting_intelligence') {
      parsedJson = {
        summary: 'The team reviewed Q3 operational performance, identified pipeline bottlenecks in enterprise demos, and agreed on key engineering deliverables for the automated risk engine.',
        keyDecisions: [
          'Adopt deterministic financial metrics calculation before AI explanation',
          'Deploy in-app notifications for leads scoring above 80',
          'Schedule weekly executive sprint review every Monday at 10 AM',
        ],
        requirements: [
          'CRM pipeline must support Won lead direct conversion to Customer',
          'All RAG vector retrieval must strictly filter by authenticated workspaceId',
        ],
        actionItems: [
          { title: 'Implement compound index on workspace collections', suggestedAssignee: 'Lead Engineer', daysUntilDue: 3 },
          { title: 'Draft customer retention campaign copy for churn-risk accounts', suggestedAssignee: 'Marketing Manager', daysUntilDue: 5 },
          { title: 'Conduct security review of file upload mime-types', suggestedAssignee: 'DevOps Specialist', daysUntilDue: 4 },
        ],
        risks: [
          'High memory overhead if document chunking is processed synchronously for large PDFs',
          'Cross-workspace data leakage if workspaceId is trusted from client body',
        ],
        followUps: [
          'Validate token consumption thresholds in AI Usage dashboard next Thursday',
        ],
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'marketing_studio') {
      parsedJson = {
        strategy: 'Target growing mid-market B2B founders and RevOps leads through educational ROI-led content pillars and multi-channel drip automation.',
        personas: [
          'Growth-Stage Founder (focus on single-source-of-truth business health)',
          'Head of Revenue Operations (focus on CRM intelligence and pipeline acceleration)',
        ],
        contentPillars: [
          'Eliminating SaaS tool sprawl with unified BI & Operations',
          'Turning raw customer feedback into proactive churn prevention',
          'Deterministic forecasting vs. LLM arithmetic hallucinations',
        ],
        ideas: [
          'Interactive ROI Calculator for startup operations',
          'Behind-the-scenes case study on AI-assisted sales pipelines',
        ],
        socialPosts: [
          {
            platform: 'LinkedIn',
            postContent: 'Most SaaS dashboards show you what happened yesterday. VentureOS predicts what happens next month by linking your CRM, finance, and customer feedback into one proactive AI risk engine.',
            hashtags: ['#SaaS', '#Operations', '#AI', '#VentureOS', '#B2B'],
          },
        ],
        emailSequences: [
          {
            step: 1,
            subject: 'Stop juggling 7 disconnected tools for your operations',
            body: 'Hi {{firstName}},\n\nMost startups lose 20% of their operational velocity switching between separate CRM, project, and analytics apps. VentureOS unifies everything under one workspace with native AI copilot capabilities.\n\nTake a look at how it works here: [link]\n\nBest,\nThe VentureOS Team',
          },
        ],
        adCopy: [
          {
            headline: 'Unify Operations & Business Intelligence',
            description: 'The AI-powered platform for ambitious startups. From CRM to finance in one connected system.',
            callToAction: 'Start Free Trial',
          },
        ],
        landingPageCopy: {
          heroHeadline: 'Operate Smarter. Grow Faster with VentureOS.',
          subhead: 'A single, intelligent platform connecting CRM, customer retention, project management, and automated forecasting.',
          valueProps: [
            'All-in-one business intelligence and operations',
            'Context-aware AI Copilot with authorized backend tools',
            'Cross-module risk detection before churn impacts revenue',
          ],
          cta: 'Deploy Your Workspace',
        },
        ctas: ['Start Your Free 14-Day Trial', 'Schedule an Executive Demo', 'Explore the Interactive Platform'],
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'competitor_intelligence') {
      parsedJson = {
        strengths: [
          'Established brand recognition in legacy enterprise segments',
          'Extensive third-party marketplace integrations',
        ],
        weaknesses: [
          'Disjointed multi-tool architecture requiring separate subscriptions',
          'No integrated cross-module risk engine or native RAG document intelligence',
          'Steep learning curve and expensive per-seat pricing',
        ],
        pricingComparison: 'Competitor relies on heavy per-seat licensing ($90+/seat/mo). VentureOS offers unified transparent tiering with included AI credits.',
        positioningComparison: 'Position VentureOS as the modern, AI-native single workspace that replaces 4-5 legacy subscriptions.',
        marketGaps: [
          'Mid-market founders lack unified risk engines that correlate sales pipelines with customer support sentiment',
          'Lack of explainable deterministic financial forecasting combined with AI strategic commentary',
        ],
        opportunities: [
          'Target dissatisfied customers of fragmented legacy suites with 1-click migration and consolidated pricing',
        ],
        threats: [
          'Competitor could introduce add-on AI chat plugins, though without unified backend data linkage',
        ],
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'market_research') {
      parsedJson = {
        marketOverview: 'The global B2B business operations and intelligent workflow software market is expanding at 18.4% CAGR, driven by the demand for consolidated SaaS platforms that eliminate operational data silos.',
        targetAudience: 'Seed to Series B technology companies, digital agencies, and professional services firms with 10â€“250 team members.',
        customerPersonas: [
          'Bootstrapped Founder: Needs immediate operational visibility and lean overhead.',
          'VP of Operations: Needs cross-functional coordination, SLA compliance, and churn risk mitigation.',
        ],
        competitorAnalysis: 'Legacy platforms offer point solutions (CRM only, or PM only) which creates information silos and costly integration debt.',
        pricingStrategy: 'Value-based tiered pricing with team workspace seats, unlimited projects, and metered AI usage credits.',
        marketOpportunities: [
          'Integration of operational data directly into LLM tool-calling without exposing raw databases.',
          'Automated workflow triggers that execute upon predictive risk thresholds.',
        ],
        risks: [
          'User adoption friction if onboarding workflow requires excessive manual data entry.',
          'AI provider latency and rate-limiting if fallback mechanisms are not resilient.',
        ],
        swot: {
          strengths: ['Unified data schema', 'Native RAG document intelligence', 'Deterministic metrics engine'],
          weaknesses: ['New brand needing authority in crowded category'],
          opportunities: ['Replacing multi-subscription software stacks for startups'],
          threats: ['Fast-moving AI commoditization requiring proprietary workflow depth'],
        },
        goToMarketStrategy: 'Product-led growth with free workspace onboarding, self-serve interactive demos, and targeted LinkedIn executive thought leadership.',
      };
      content = JSON.stringify(parsedJson, null, 2);
    } else if (module === 'copilot') {
      const lower = lastUserMessage.toLowerCase();
      if (options.tools && options.tools.length > 0 && (lower.includes('pipeline') || lower.includes('sales') || lower.includes('lead'))) {
        toolCalls = [{
          id: 'call_mock_pipeline_' + Date.now(),
          name: 'get_pipeline_summary',
          arguments: {},
        }];
        content = '';
      } else if (options.tools && options.tools.length > 0 && (lower.includes('revenue') || lower.includes('mrr') || lower.includes('financial'))) {
        toolCalls = [{
          id: 'call_mock_revenue_' + Date.now(),
          name: 'get_revenue_data',
          arguments: {},
        }];
        content = '';
      } else {
        content = `I have analyzed your operational workspace data. Your CRM pipelines, sprint velocity, and deterministic runway calculations are currently tracking on schedule.`;
      }
    } else {
      content = `AI analysis complete for module ${module}. Operational context gathered and evaluated.`;
    }

    const latencyMs = Date.now() - startTime;
    const promptTokens = Math.ceil(lastUserMessage.length / 4) + 120;
    const completionTokens = Math.ceil(content.length / 4);

    return {
      content,
      parsedJson,
      toolCalls,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: ((promptTokens * 0.0000015) + (completionTokens * 0.000002)),
      },
      latencyMs,
      model: this.name,
    };
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    // Generate deterministic 768-dimensional normalized vector from text hash
    const vector: number[] = new Array(768).fill(0);
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      vector[i % 768] += code * ((i % 5) + 1);
    }
    // Normalize to unit vector
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
    return vector.map((v) => Number((v / norm).toFixed(6)));
  }
}

