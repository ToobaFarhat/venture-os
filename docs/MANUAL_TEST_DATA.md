# VentureOS — Standard Manual Test Dataset
**Company Under Test:** Northstar Business Systems  
**Document Purpose:** Consistent, verifiable dummy data for manual verification and acceptance testing of VentureOS.  
**Strict Policy:** All competitor data, financial transactions, and lead records in this document are entirely fictional test fixtures. Never use reserved example addresses (`@example.com`) for testing actual inbox delivery. For live email verification or invitations, use a real email inbox that you control.

---

## 1. Company & Workspace Profile

| Field Label | Application Input Value | Explanation / Purpose |
| :--- | :--- | :--- |
| **Full Name (Owner)** | `Marcus Vance` | Fictional executive founder for registration |
| **Work Email (Test Input)** | `owner@example.com` *(or your real email for verification)* | Registered account email |
| **Password** | `Northstar2026!Secure` *(choose your own secure password)* | Account password |
| **Company / Organization** | `Northstar Business Systems` | Registered business name |
| **Workspace Name** | `Northstar Demo Workspace` | Primary multi-tenant operational workspace |
| **Primary Industry** | `B2B SaaS / Business Software` | Industry segment for AI lead scoring & benchmarks |
| **Website** | `https://northstar-systems.io` | Company homepage link |
| **Company Description** | `Northstar Business Systems provides subscription-based workflow automation and customer support software to startups and mid-market organizations.` | Context used by AI Sales Assistant & Copilot |
| **Target Audience** | `Mid-market SaaS companies, operations directors, and customer support managers` | Audience definition used by Marketing Studio |
| **Operating Currency** | `USD ($)` | Currency for deterministic FP&A forecasting |
| **Core Products** | `1. Northstar Desk (Customer Support Automation)`<br>`2. Northstar Insights (Workflow Analytics)` | Flagship products |
| **Services Offered** | `Workflow Automation Consulting, Migration Onboarding, 24/7 SLA Support` | Professional service offerings |
| **Strategic Goals** | `1. Reduce customer support response times`<br>`2. Improve quarterly net dollar retention (NDR)`<br>`3. Scale MRR past $120k with <5% annual churn` | Core KPIs for AI Copilot strategy generation |

---

## 2. Test Team Members & RBAC Roles

| Full Name | Role | Test Work Email | Expected Permissions / Testing Scope |
| :--- | :--- | :--- | :--- |
| **Marcus Vance** | **Owner** | `owner@example.com` | Full unrestricted authority; billing; workspace deletion; member role updates |
| **Elena Rostova** | **Admin** | `elena.admin@example.com` | User management; settings updates; audit logs; AI usage oversight |
| **David Chen** | **Manager** | `david.manager@example.com` | Lead assignment; project planning; campaign approval; risk analysis |
| **Sarah Jenkins** | **Employee** | `sarah.dev@example.com` | Task execution; lead updates; customer interaction logging |
| **Alex Rivera** | **Viewer** | `alex.viewer@example.com` | Read-only access to dashboards, reports, and pipelines; cannot edit records |

> **Note on Email Delivery:** To test live invitation delivery via SMTP/Ethereal, invite a real email address you control or inspect server console logs where Ethereal test inbox URLs are printed.

---

## 3. CRM & Lead Pipeline Test Records

Enter these 5 fictional leads into **CRM & Leads** (`/crm`):

### Lead 1: Enterprise Prospect (High Deal Value)
- **Contact Name:** `Jonathan Reynolds`
- **Company:** `Apex Logistics International`
- **Email:** `j.reynolds@apexlogistics.example.com`
- **Phone:** `+1 (555) 234-5678`
- **Deal Value:** `55000`
- **Industry:** `Logistics & Supply Chain`
- **Lead Source:** `Inbound Website`
- **Stage / Status:** `Qualified`
- **Notes:** `Evaluating replacement for Zendesk and Jira. Needs unified customer intelligence and multi-tenant SLA management. Budget approved for Q4.`

### Lead 2: Mid-Market Fast Mover (Demo Ready)
- **Contact Name:** `Sophia Martinez`
- **Company:** `CloudScale Fintech`
- **Email:** `smartinez@cloudscale.example.com`
- **Phone:** `+1 (555) 345-6789`
- **Deal Value:** `28000`
- **Industry:** `Financial Technology`
- **Lead Source:** `LinkedIn Outreach`
- **Stage / Status:** `Proposal`
- **Notes:** `High urgency. Experiencing customer support bottlenecks after Series A funding. Interested in Northstar Desk automation.`

### Lead 3: High-Value Expansion Prospect (Negotiation)
- **Contact Name:** `Liam O'Connor`
- **Company:** `OmniRetail Global`
- **Email:** `loconnor@omniretail.example.com`
- **Phone:** `+1 (555) 456-7890`
- **Deal Value:** `85000`
- **Industry:** `E-Commerce & Retail`
- **Lead Source:** `Executive Referral`
- **Stage / Status:** `Negotiation`
- **Notes:** `Procurement reviewing legal security requirements and SOC2 compliance. Requires 99.9% platform uptime guarantee.`

### Lead 4: Early Stage Inbound (New Lead)
- **Contact Name:** `Amina Zahra`
- **Company:** `Veritas Health Solutions`
- **Email:** `azahra@veritashealth.example.com`
- **Phone:** `+1 (555) 567-8901`
- **Deal Value:** `15000`
- **Industry:** `Healthcare SaaS`
- **Lead Source:** `Webinar Attendee`
- **Stage / Status:** `New`
- **Notes:** `Attended our Q3 Workflow Efficiency Webinar. Downloaded our case study.`

### Lead 5: Unqualified / Price Sensitive (Lost Lead)
- **Contact Name:** `Kevin Brooks`
- **Company:** `Boutique Crafts LLC`
- **Email:** `kbrooks@boutiquecrafts.example.com`
- **Phone:** `+1 (555) 678-9012`
- **Deal Value:** `2500`
- **Industry:** `Retail`
- **Lead Source:** `Cold Email`
- **Stage / Status:** `Lost`
- **Notes:** `Budget capped at $50/month. Below our minimum qualification threshold.`

---

## 4. Customer Records & Churn Intelligence

Enter these records into **Customers 360** (`/customers`):

### Customer 1: Stellar Enterprise Account (Healthy)
- **Customer Name:** `Vanguard Aerospace Technologies`
- **Contact Person:** `Robert Sterling`
- **Email:** `rsterling@vanguardaero.example.com`
- **Subscription Tier:** `Enterprise Annual`
- **Monthly Recurring Revenue (MRR):** `4500`
- **Lifetime Value (LTV):** `54000`
- **Health Score:** `92/100` (Low Risk)
- **Interaction Log:** `Executive business review completed; expanded seats to engineering department.`

### Customer 2: At-Risk Account (Churn Detection Candidate)
- **Customer Name:** `PulseMetric Analytics`
- **Contact Person:** `Devon Miller`
- **Email:** `dmiller@pulsemetric.example.com`
- **Subscription Tier:** `Growth Monthly`
- **Monthly Recurring Revenue (MRR):** `1800`
- **Lifetime Value (LTV):** `10800`
- **Health Score:** `48/100` (High Churn Risk)
- **Support Issues:** `3 open tickets regarding CSV export latency and missing webhooks.`
- **Recent Interaction:** `Customer expressed frustration with webhook reliability during billing cycle.`

---

## 5. Customer Feedback Records

Enter these records into **Customer Feedback** (`/feedback`):

| Type / Sentiment | Customer Name | Feedback Text | Expected Topic | Expected Urgency |
| :--- | :--- | :--- | :--- | :--- |
| **Positive** | `Vanguard Aerospace Technologies` | `"Northstar Desk has automated 60% of our tier-1 tickets within three weeks. Our team SLA compliance is at an all-time high."` | `Product / Value` | `Low` |
| **Negative (Support)** | `PulseMetric Analytics` | `"Support response time was over 48 hours for our critical webhook failure. This blocked our automated billing cycle."` | `Support` | `High` |
| **Negative (Pricing)** | `DataStream Corp` | `"The 30% price hike on seat renewals feels unjustified without advanced SSO included in the Pro tier."` | `Pricing` | `Medium` |
| **Neutral (Feature Request)**| `SyncPoint Solutions` | `"The dashboard metrics are solid, but we really need automated weekly PDF summary reports sent to executive stakeholders."` | `Feature Request`| `Low` |
| **Delivery / Service** | `Kestrel Media` | `"Onboarding consultation was delayed by three days due to scheduling conflicts on your implementation team."` | `Service` | `Medium` |

---

## 6. Projects & Tasks Manual Test Records

Enter into **Projects & Tasks** (`/projects`):

### Project 1: Manual Project Creation
- **Project Title:** `Q4 Core Platform Performance Optimization`
- **Objective:** `Reduce API p95 response time below 180ms across all tenant query endpoints.`
- **Category:** `Engineering / Infrastructure`
- **Status:** `In Progress`
- **Budget:** `25000`
- **Due Date:** `December 15, 2026`
- **Tasks to add:**
  1. `Task 1: Add compound database index on { workspaceId: 1, status: 1 }` (Priority: `High`, Assignee: `Sarah Jenkins`)
  2. `Task 2: Configure Redis query cache for financial metric aggregates` (Priority: `High`, Assignee: `Sarah Jenkins`)
  3. `Task 3: Run load test simulating 50 concurrent tenant operations` (Priority: `Medium`, Assignee: `David Chen`)

---

## 7. AI Project Planner Test Data

In **Projects & Tasks** (`/projects`), open **AI Project Planner** (`Plan with AI`):

- **Project Goal / Brief:**  
  `Launch an aggressive 60-day customer churn prevention initiative targeting all accounts with health scores below 60.`
- **Industry Context:**  
  `B2B SaaS / Business Software`
- **Expected Deliverables:**  
  `Customer audit, dedicated CS outreach, webhook reliability patches, automated weekly usage reviews`
- **Estimated Budget:**  
  `18000`
- **Expected Duration:**  
  `60 days`

---

## 8. Document Intelligence & RAG Test Fixtures

Create a plain text file named `Northstar_Security_and_SLA.txt` on your computer with the exact content below and upload it to **Document RAG** (`/documents`):

```text
NORTHSTAR BUSINESS SYSTEMS — ENTERPRISE SLA & SECURITY CHARTER
Document Reference: NBS-SEC-2026-V3
Published: October 2026
Confidentiality: Public / Customer Facing

1. SYSTEM AVAILABILITY & SLA GUARANTEE
Northstar Business Systems guarantees a monthly uptime Service Level Agreement (SLA) of 99.95% for all Enterprise customers.
Scheduled maintenance occurs on the second Sunday of every month between 02:00 UTC and 04:00 UTC, with a mandatory 7-day advance notice.
If monthly uptime drops below 99.95%, customers are entitled to SLA penalty credits:
- 99.0% to 99.94%: 10% monthly subscription credit
- 95.0% to 98.99%: 25% monthly subscription credit
- Below 95.0%: 50% monthly subscription credit

2. MULTI-TENANT DATA ISOLATION & ENCRYPTION
All tenant databases are logically isolated using verified workspace identifier indexing. Cross-tenant data leakage is prevented via mandatory middleware authentication.
Data at rest is encrypted using AES-256 cipher standards.
Data in transit across public networks requires TLS 1.3 encryption.

3. DISASTER RECOVERY & BACKUP OBJECTIVES
- Recovery Point Objective (RPO): 15 minutes (automated continuous transactional oplog backups).
- Recovery Time Objective (RTO): 2 hours for full secondary cluster failover.

4. COMPLIANCE CERTIFICATIONS
Northstar Systems is certified under SOC 2 Type II, ISO/IEC 27001:2022, and complies with EU GDPR regulations.
```

### Verification Questions for Document Q&A:
1. **Present in document:** `"What is the SLA uptime guarantee and what credit is provided if uptime is 97%?"`  
   *Expected Answer:* 99.95% uptime guarantee; a 25% monthly subscription credit is provided for uptime between 95.0% and 98.99%.
2. **Present in document:** `"What are the RPO and RTO disaster recovery targets?"`  
   *Expected Answer:* RPO is 15 minutes, RTO is 2 hours.
3. **Absent from document:** `"What is Northstar's refund policy for annual hardware server purchases?"`  
   *Expected Answer:* The document does not contain information about hardware refunds (grounded RAG prevents hallucination).

---

## 9. Meeting Intelligence Transcript Test Data

In **Meeting Intelligence** (`/meetings`), open **Record / Ingest Transcript** and paste the following conversation:

```text
Executive Weekly Operations & Revenue Sync
Date: October 24, 2026
Attendees: Marcus Vance (CEO), Elena Rostova (VP Ops), David Chen (Sales Lead), Sarah Jenkins (Tech Lead)

[00:01] Marcus Vance: Good morning everyone. Let's review our Q4 priorities. David, how is the enterprise pipeline looking?
[00:02] David Chen: Apex Logistics is ready to move forward with a $55,000 contract if we can provide our SOC 2 Type II compliance report by Friday. Sophia at CloudScale is also waiting for a custom sandbox demo.
[00:04] Elena Rostova: I can send Apex Logistics our SOC 2 Type II certification today. David, let's schedule Sophia's sandbox demo for Wednesday at 2 PM.
[00:05] Marcus Vance: Excellent. Sarah, what is the status of the customer export webhook issue reported by PulseMetric Analytics?
[00:06] Sarah Jenkins: We identified the bug in the event emitter queue. I will deploy a hotfix to staging by tomorrow 5 PM and push to production on Thursday morning.
[00:08] Marcus Vance: Let's make sure Devon at PulseMetric receives a personal update once the patch is live. Elena, please draft that customer communication.
[00:10] David Chen: I will also follow up with Liam at OmniRetail regarding their $85,000 renewal proposal before Friday close of business.
[00:12] Marcus Vance: Meeting adjourned. Thank you team.
```

---

## 10. Financial Records for Deterministic FP&A

Enter these records into **Finance & Forecast** (`/finance`):

### Revenue Entries (Income)
1. `Date: 2026-08-01` | `Category: Subscription` | `Amount: 18500` | `Description: August Enterprise SaaS Subscriptions`
2. `Date: 2026-09-01` | `Category: Subscription` | `Amount: 22000` | `Description: September Enterprise SaaS Subscriptions`
3. `Date: 2026-10-01` | `Category: Subscription` | `Amount: 26500` | `Description: October Enterprise SaaS Subscriptions`
4. `Date: 2026-10-15` | `Category: Services`     | `Amount: 7500`  | `Description: Enterprise Onboarding Consulting Fee`

### Expense Entries (Costs)
1. `Date: 2026-08-15` | `Category: Infrastructure` | `Amount: 4200` | `Description: AWS & Cloud Database Hosting`
2. `Date: 2026-09-15` | `Category: Infrastructure` | `Amount: 4500` | `Description: AWS & Cloud Database Hosting`
3. `Date: 2026-10-05` | `Category: Marketing`      | `Amount: 6000` | `Description: Q4 Paid Search & LinkedIn Ads`
4. `Date: 2026-10-15` | `Category: Infrastructure` | `Amount: 4800` | `Description: AWS & Cloud Database Hosting`
5. `Date: 2026-10-20` | `Category: Payroll`         | `Amount: 12000`| `Description: Contractor & Engineering Payroll`

---

## 11. Marketing Campaigns Test Data

Enter into **Marketing Studio** (`/marketing`):

- **Campaign Name:** `Q4 Enterprise SaaS Modernization`
- **Product:** `Northstar Desk & Insights`
- **Objective:** `Lead Generation & Inbound Demos`
- **Target Audience:** `VPs of Engineering & Directors of Customer Support`
- **Platform:** `LinkedIn Sponsored Content`
- **Budget:** `8000`
- **Start Date:** `2026-11-01`
- **End Date:** `2026-11-30`

---

## 12. Fictional Competitor Profiles

Enter into **Competitors & SWOT** (`/competitors`):
*(Note: Fictional benchmark records for testing feature capabilities)*

- **Competitor Name:** `LegacyCRM Suite`
- **Product Name:** `LegacyCRM Enterprise`
- **Pricing:** `$120 / seat / month (Annual lock-in)`
- **Strengths:** `High brand recognition, large enterprise market share, established partner network.`
- **Weaknesses:** `Clunky 2012 UI, slow query speeds, requires expensive external consultants for integration, lacks real-time AI decision engine.`
- **Our Strategic Advantage:** `Unified 10-module operational cockpit with native AI Copilot and 48-hour onboarding.`

---

## 13. AI Copilot Multi-Turn Testing Sequence

Open the **AI Copilot** (top bar button) and ask this exact 7-step sequence:

1. **General Query (Sanity Check):**  
   `"What are the key advantages of a unified business operating system compared to disconnected SaaS point tools?"`
2. **Real Business Data Retrieval:**  
   `"How many active leads are currently in our sales pipeline and what is our total pipeline deal value?"`
3. **Diagnostic Analysis:**  
   `"Which accounts or leads have the highest churn risk or lowest health scores right now?"`
4. **Contextual Follow-up:**  
   `"What specific customer feedback or support issues contributed to that low score?"`
5. **Strategic Recommendation:**  
   `"What is your recommended action plan for our sales team to close Jonathan Reynolds at Apex Logistics?"`
6. **Action Proposal Generation:**  
   `"Please prepare an action proposal to create a high-priority follow-up task for Jonathan Reynolds due this Friday."`
7. **Action Card Review & Confirmation:**  
   *(Verify that an interactive Action Proposal Card appears requiring explicit 'Confirm' click before creating the database task).*
