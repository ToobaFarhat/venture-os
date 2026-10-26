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

      // ── 1. Check if this is Round 2: synthesizing live tool results ─────────
      if (lastUserMessage.includes('Here is the verified live data returned by "')) {
        const toolMatch = lastUserMessage.match(/Here is the verified live data returned by "([^"]+)"/);
        const toolName = toolMatch ? toolMatch[1] : '';

        let toolData: any = {};
        const jsonMatch = lastUserMessage.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            toolData = JSON.parse(jsonMatch[1]);
          } catch {}
        }

        if (toolName === 'getSalesPipeline') {
          if (toolData.dataAvailable === false) {
            content = `### Sales Pipeline Overview\n\nThere are currently no active leads in this workspace. To populate your pipeline, head to **CRM & Leads** (\`/crm\`) and add new leads.`;
          } else {
            const stages = toolData.stages || {};
            const activeStages = Object.entries(stages)
              .filter(([_, info]: any) => info.count > 0)
              .map(([stg, info]: any) => `- **${stg}:** ${info.count} deal${info.count !== 1 ? 's' : ''} ($${(info.totalDealValue || 0).toLocaleString()})`);

            content =
              `### 📊 Live CRM Sales Pipeline Summary\n\n` +
              `Based on verified live database records in your active workspace:\n\n` +
              `- **Total Pipeline Leads:** **${toolData.totalLeads ?? 0} leads**\n` +
              `- **Total Pipeline Deal Value:** **$${(toolData.totalPipelineValue ?? 0).toLocaleString()}**\n` +
              (toolData.winRate !== null ? `- **Conversion / Win Rate:** **${toolData.winRate}%**\n` : '') +
              (toolData.weightedPipelineValue ? `- **Weighted Expected Value:** **$${toolData.weightedPipelineValue.toLocaleString()}**\n\n` : '\n') +
              `**Current Stage Breakdown:**\n` +
              (activeStages.length > 0 ? activeStages.join('\n') : '- No stage records found') +
              `\n\n*All metrics retrieved directly from your operational leads collection without estimation.*`;
          }
        } else if (toolName === 'getRevenueData') {
          if (toolData.dataAvailable === false) {
            content = `### Financial & Runway Status\n\nNo financial transactions recorded yet. Navigate to **Finance & Forecast** (\`/finance\`) to record revenue or expense entries.`;
          } else {
            content =
              `### 💰 Verified Financial & Runway Status\n\n` +
              `- **Total Revenue:** **$${(toolData.totalRevenue ?? 0).toLocaleString()}**\n` +
              `- **Total Operating Expenses:** **$${(toolData.totalExpenses ?? 0).toLocaleString()}**\n` +
              `- **Net Profit / Cash Flow:** **${toolData.netProfit >= 0 ? '+' : ''}$${(toolData.netProfit ?? 0).toLocaleString()}**\n` +
              `- **Monthly Recurring Revenue (MRR):** **$${(toolData.mrr ?? 0).toLocaleString()}**\n` +
              `- **Annual Run Rate (ARR):** **$${(toolData.arr ?? 0).toLocaleString()}**\n` +
              `- **Cash Runway:** **${toolData.burnRate === 0 ? 'Self-sustaining & profitable (>24 months)' : `${toolData.estimatedRunwayMonths} months`}**\n\n` +
              `*Calculated using 100% deterministic accounting rules from your financial ledger.*`;
          }
        } else if (toolName === 'getCustomers') {
          const customers = toolData.customers || [];
          const highRisk = customers.filter(
            (c: any) => c.churnRisk === 'high' || c.churnRisk === 'critical' || (c.healthScore && c.healthScore < 60)
          );

          content =
            `### ⚠️ Customer Health & Churn Risk Assessment\n\n` +
            `Based on active accounts in your customer ledger:\n\n` +
            (highRisk.length > 0
              ? `**Accounts Requiring Immediate Attention:**\n` +
                highRisk
                  .map(
                    (c: any) =>
                      `- **${c.name}** (${c.company}): Health Score **${c.healthScore ?? 'N/A'}/100** | Churn Risk: **${(c.churnRisk || 'high').toUpperCase()}** | MRR: $${(c.mrr || 0).toLocaleString()}`
                  )
                  .join('\n') +
                `\n\n*Primary Factor:* Low health score correlates with recent negative support feedback. Executive check-in and technical resolution recommended.`
              : `All active customer accounts are tracking with healthy metrics (average score > 80/100).`) +
            `\n\n- **Total Customer Accounts:** ${toolData.count ?? customers.length}`;
        } else if (toolName === 'getCustomerFeedback') {
          const urgent = toolData.highUrgencyIssues || [];
          content =
            `### 💬 Customer Feedback & Support Diagnostics\n\n` +
            `- **Sampled Feedback Entries:** ${toolData.totalSampled ?? 0}\n` +
            `- **Customer Satisfaction Rate:** **${toolData.satisfactionRate ?? 0}%**\n` +
            `- **Sentiment Breakdown:** ${toolData.sentimentCounts?.positive ?? 0} Positive, ${toolData.sentimentCounts?.neutral ?? 0} Neutral, ${toolData.sentimentCounts?.negative ?? 0} Negative\n\n` +
            (urgent.length > 0
              ? `**Specific Issues Driving Negative Sentiment:**\n` +
                urgent
                  .map((u: any) => `- **${u.customerName}** (*${u.topic}*): "${u.content}"`)
                  .join('\n') +
                `\n\n*Resolution Required:* Technical patch and direct communication to mitigate churn risk.`
              : `No critical support escalations or unresolved complaints logged.`);
        } else if (toolName === 'getProjectStatus') {
          content =
            `### 📁 Project Management & Milestone Status\n\n` +
            `- **Active Projects:** ${toolData.totalProjects ?? 0}\n` +
            `- **Total Tasks:** ${toolData.totalTasks ?? 0} (${toolData.completedTasks ?? 0} Completed — **${toolData.completionRate ?? 0}%**)\n` +
            `- **Overdue Tasks:** **${toolData.overdueTasksCount ?? 0}**\n` +
            (toolData.overdueTasksList?.length > 0
              ? `\n**Overdue Delivery Items:**\n` +
                toolData.overdueTasksList.map((t: any) => `- ${t.title} (Priority: ${t.priority})`).join('\n')
              : '\nAll sprint deliverables are tracking on schedule.');
        } else if (toolName === 'getLeads') {
          const leads = toolData.leads || [];
          content =
            `### 🎯 Qualified Leads Overview\n\n` +
            `Top pipeline leads retrieved from database:\n\n` +
            leads
              .map(
                (l: any) =>
                  `- **${l.name}** (${l.company}) — Value: **$${(l.dealValue || 0).toLocaleString()}** | Stage: **${l.status}** | AI Score: **${l.aiScore ?? 'N/A'}/100**`
              )
              .join('\n');
        } else {
          content =
            `### Operational Data Retrieved\n\n` +
            `Verified live records from **${toolName}**:\n\n` +
            `\`\`\`json\n${JSON.stringify(toolData, null, 2).slice(0, 500)}\n\`\`\``;
        }
      }
      // ── 2. Check if this is Round 1: user prompt requiring tool call or direct answer ──
      else {
        // Check for Action Proposal (task creation)
        if (
          lower.includes('action proposal') ||
          lower.includes('create a task') ||
          lower.includes('create task') ||
          lower.includes('follow-up task') ||
          lower.includes('prepare an action') ||
          lower.includes('add task')
        ) {
          const isJonathan = lower.includes('jonathan') || lower.includes('reynolds') || lower.includes('apex');
          toolCalls = [
            {
              id: 'call_createTask_' + Date.now(),
              name: 'createTask',
              args: {
                title: isJonathan
                  ? 'High-Priority Follow-up: Jonathan Reynolds (Apex Logistics)'
                  : 'High-Priority Follow-up Task',
                description: isJonathan
                  ? 'Deliver SOC 2 Type II compliance report and finalize procurement contract for $55,000 enterprise deal.'
                  : 'Execute high-priority operational deliverable.',
                priority: 'urgent',
                dueDate: '2026-10-30',
              },
            },
          ];
          content = '';
        }
        // Check for Sales / Pipeline / Deals / Active Leads
        else if (
          lower.includes('pipeline') ||
          lower.includes('how many active leads') ||
          lower.includes('deal value') ||
          (lower.includes('sales') && !lower.includes('advantage')) ||
          (lower.includes('lead') && !lower.includes('advantage') && !lower.includes('leadership'))
        ) {
          toolCalls = [
            {
              id: 'call_pipeline_' + Date.now(),
              name: 'getSalesPipeline',
              args: {},
            },
          ];
          content = '';
        }
        // Check for Revenue / Finance / Profit / MRR / Runway
        else if (
          lower.includes('revenue') ||
          lower.includes('mrr') ||
          lower.includes('arr') ||
          lower.includes('expense') ||
          lower.includes('net profit') ||
          lower.includes('runway') ||
          lower.includes('burn rate')
        ) {
          toolCalls = [
            {
              id: 'call_revenue_' + Date.now(),
              name: 'getRevenueData',
              args: {},
            },
          ];
          content = '';
        }
        // Check for Churn risk / Customer health
        else if (
          lower.includes('churn') ||
          lower.includes('lowest health') ||
          lower.includes('at-risk') ||
          (lower.includes('health') && (lower.includes('customer') || lower.includes('score') || lower.includes('account')))
        ) {
          toolCalls = [
            {
              id: 'call_customers_' + Date.now(),
              name: 'getCustomers',
              args: {},
            },
          ];
          content = '';
        }
        // Check for Feedback / Complaints / Support issues
        else if (
          lower.includes('feedback') ||
          lower.includes('support issue') ||
          lower.includes('complaint') ||
          lower.includes('ticket') ||
          lower.includes('what specific customer') ||
          lower.includes('contributed to that low score')
        ) {
          toolCalls = [
            {
              id: 'call_feedback_' + Date.now(),
              name: 'getCustomerFeedback',
              args: {},
            },
          ];
          content = '';
        }
        // Check for Projects / Sprints / Tasks
        else if (
          lower.includes('project') ||
          lower.includes('sprint') ||
          lower.includes('overdue task') ||
          lower.includes('milestone')
        ) {
          toolCalls = [
            {
              id: 'call_projects_' + Date.now(),
              name: 'getProjectStatus',
              args: {},
            },
          ];
          content = '';
        }
        // General Strategic Inquiry: Unified OS vs Disconnected SaaS point tools
        else if (
          lower.includes('advantage') ||
          lower.includes('unified') ||
          lower.includes('point tool') ||
          lower.includes('disconnected') ||
          lower.includes('operating system')
        ) {
          content =
            `### Key Advantages of a Unified Business Operating System\n\n` +
            `Operating a business on a single unified platform rather than disconnected SaaS point tools provides four major competitive advantages:\n\n` +
            `1. **Elimination of Data Silos & Friction:**\n` +
            `   Standalone tools (separate CRM, disjointed project boards, isolated accounting, and disconnected support tickets) cause conflicting customer records. A unified operating system provides a **single source of truth** across your entire operations.\n\n` +
            `2. **Cross-Module Intelligence & Automated Risk Corroboration:**\n` +
            `   When an enterprise account logs a critical support complaint, traditional point tools leave it isolated in a support queue. In VentureOS, customer support sentiment immediately alerts the sales team before renewal and recalculates churn probability.\n\n` +
            `3. **Context-Aware AI Copilot Grounded in Live Data:**\n` +
            `   Generic AI chatbots lack internal business context. VentureOS Copilot has secure, authorized access to your live pipeline, financials, tasks, and documents, proposing verifiable actions through Human-in-the-Loop guardrails.\n\n` +
            `4. **Drastic Cost & Vendor Consolidation:**\n` +
            `   Replacing 5–7 separate SaaS subscriptions eliminates redundant per-seat licensing, complex Zapier integrations, and security overhead under a single unified platform.`;
        }
        // Sales Strategy Recommendation: Apex Logistics / Jonathan Reynolds
        else if (
          lower.includes('jonathan') ||
          lower.includes('apex') ||
          (lower.includes('action plan') && lower.includes('sales'))
        ) {
          content =
            `### Recommended Action Plan: Closing Apex Logistics ($55,000 Opportunity)\n\n` +
            `To successfully close **Jonathan Reynolds** at **Apex Logistics International**:\n\n` +
            `1. **Deliver Compliance Verification:** Send our SOC 2 Type II compliance certificate and 99.95% uptime SLA documentation by Friday morning.\n` +
            `2. **Tailored Workflow Demo:** Schedule a dedicated demonstration highlighting unified customer intelligence and multi-tenant SLA management.\n` +
            `3. **Executive Sponsor Alignment:** Arrange an executive sync with Marcus Vance before Friday close of business to finalize contract execution.`;
        }
        // General Fallback
        else {
          content =
            `I have analyzed your workspace operational context. Your CRM pipelines, active customers, sprint deliverables, and financial records are active and synchronized.\n\n` +
            `Feel free to ask about your live pipeline totals, revenue metrics, customer churn risks, or request an action proposal card.`;
        }
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

