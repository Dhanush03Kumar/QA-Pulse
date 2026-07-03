import { useState, useEffect } from "react";
import {
  LayoutDashboard, CheckSquare, BookOpen, Mail, Calendar, Bug,
  FolderKanban, Cpu, Activity, ChevronLeft, ChevronRight,
  Search, Bell, Plus, Sun, Moon, Copy, AlertTriangle,
  CheckCircle, Clock, Star, X, Zap, Target,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ──────────────────────────────────────────────────────────────────

type Priority = "critical" | "high" | "medium" | "low";
type TaskStatus = "todo" | "in-progress" | "blocked" | "done";
type DefectStatus = "open" | "in-progress" | "resolved" | "closed" | "reopened";
type Severity = "critical" | "major" | "minor" | "trivial";
type NavItem =
  | "dashboard" | "tasks" | "knowledge" | "templates"
  | "meetings" | "defects" | "projects" | "automation" | "activity";

interface Task {
  id: string; title: string; priority: Priority; status: TaskStatus;
  dueDate: string; project: string; description: string; tags: string[];
}
interface Defect {
  id: string; defectId: string; summary: string; severity: Severity;
  status: DefectStatus; project: string; assignee: string; createdAt: string;
  rca: string; workaround: string; lessonsLearned: string;
}
interface Template {
  id: string; title: string; subject: string; body: string;
  category: "daily-status" | "follow-up" | "escalation" | "env-issues" | "release-signoff";
  isFavorite: boolean;
}
interface Meeting {
  id: string; title: string; date: string; time: string;
  type: "standup" | "review" | "planning" | "retrospective" | "demo";
  attendees: string[]; notes: string; actionItems: string[];
  status: "upcoming" | "completed";
}
interface KBEntry {
  id: string; title: string; content: string;
  category: "test-data" | "sql" | "troubleshooting" | "environments" | "learning" | "release-notes";
  tags: string[]; updatedAt: string; isFavorite: boolean;
}
interface Project {
  id: string; name: string; status: "active" | "planning" | "completed" | "on-hold";
  progress: number; totalTests: number; passedTests: number; failedTests: number;
  blockedTests: number; defectsOpen: number; defectsClosed: number;
  releaseDate: string; version: string; description: string;
}
interface ActivityEntry {
  id: string; action: string; module: string; timestamp: string; details: string;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const INIT_TASKS: Task[] = [
  { id: "1", title: "Write regression test suite for checkout flow", priority: "high", status: "in-progress", dueDate: "2026-07-02", project: "E-Commerce v3.2", description: "Complete regression coverage for the new checkout redesign including payment gateway changes.", tags: ["regression", "checkout"] },
  { id: "2", title: "Verify payment gateway integration — Stripe v4", priority: "critical", status: "todo", dueDate: "2026-06-28", project: "E-Commerce v3.2", description: "Test all Stripe v4 API endpoints including webhooks and refund flows.", tags: ["integration", "payment"] },
  { id: "3", title: "Update test data for new user roles", priority: "medium", status: "done", dueDate: "2026-06-25", project: "Auth Service 2.1", description: "Create test accounts for the 3 new permission tiers in Auth Service.", tags: ["test-data", "auth"] },
  { id: "4", title: "Performance testing — API response times", priority: "high", status: "blocked", dueDate: "2026-07-05", project: "E-Commerce v3.2", description: "Load test API endpoints under 1000 concurrent users. Blocked on staging environment.", tags: ["performance", "api"] },
  { id: "5", title: "Smoke test production deployment", priority: "critical", status: "todo", dueDate: "2026-06-27", project: "Auth Service 2.1", description: "Post-deployment smoke test checklist for prod release.", tags: ["smoke", "production"] },
  { id: "6", title: "Document SQL queries for reports module", priority: "low", status: "in-progress", dueDate: "2026-07-10", project: "Analytics Dashboard", description: "Document all custom SQL queries used in the reporting module.", tags: ["documentation", "sql"] },
  { id: "7", title: "Cross-browser compatibility check", priority: "medium", status: "todo", dueDate: "2026-07-08", project: "E-Commerce v3.2", description: "Test on Chrome, Firefox, Safari, Edge for all critical user flows.", tags: ["compatibility", "browser"] },
  { id: "8", title: "Review automation script for login flow", priority: "high", status: "done", dueDate: "2026-06-24", project: "Auth Service 2.1", description: "Code review and optimization of Playwright login automation scripts.", tags: ["automation", "review"] },
];

const SAMPLE_DEFECTS: Defect[] = [
  { id: "1", defectId: "BUG-1042", summary: "Checkout fails when applying multiple discount codes", severity: "critical", status: "open", project: "E-Commerce v3.2", assignee: "Dev: Arjun Mehta", createdAt: "2026-06-25", rca: "Race condition in discount validation service when processing concurrent coupon API calls.", workaround: "Apply coupons one at a time with a 2-second delay between applications.", lessonsLearned: "Add concurrency tests for all discount/promo flows going forward." },
  { id: "2", defectId: "BUG-1038", summary: "PDF invoice generation fails for orders >100 items", severity: "major", status: "in-progress", project: "E-Commerce v3.2", assignee: "Dev: Priya Nair", createdAt: "2026-06-23", rca: "Memory overflow in PDF library — no pagination for large item sets.", workaround: "Generate invoices manually via admin panel for orders exceeding 100 items.", lessonsLearned: "Test boundary conditions for all document generation functions." },
  { id: "3", defectId: "BUG-1031", summary: "OAuth token refresh fails silently on mobile Safari", severity: "major", status: "resolved", project: "Auth Service 2.1", assignee: "Dev: Ravi Shankar", createdAt: "2026-06-20", rca: "Safari blocks third-party cookies by default; token refresh relied on cookie-based session.", workaround: "Users must re-login after token expiry on mobile Safari.", lessonsLearned: "Always test auth flows on Safari with default ITP settings enabled." },
  { id: "4", defectId: "BUG-1027", summary: "Dashboard charts not loading on slow connections (<3G)", severity: "minor", status: "open", project: "Analytics Dashboard", assignee: "Dev: Sneha Patel", createdAt: "2026-06-18", rca: "No lazy loading or skeleton states — charts block render on slow network.", workaround: "None — charts fail to load for users on slow connections.", lessonsLearned: "Implement skeleton loading states for all chart components." },
  { id: "5", defectId: "BUG-1019", summary: "Export CSV truncates rows > 10,000 records", severity: "major", status: "closed", project: "Analytics Dashboard", assignee: "Dev: Kiran Rao", createdAt: "2026-06-14", rca: "CSV export hard-coded limit of 10k rows; not documented in UI.", workaround: "Use date-range filters to export in batches under 10k rows.", lessonsLearned: "Document all export limits in UI; implement streaming for large exports." },
  { id: "6", defectId: "BUG-1055", summary: "Search autocomplete returns stale results after profile update", severity: "minor", status: "reopened", project: "E-Commerce v3.2", assignee: "Dev: Arjun Mehta", createdAt: "2026-06-26", rca: "Redis cache not invalidated on profile update.", workaround: "Hard refresh browser to clear local cache.", lessonsLearned: "Cache invalidation strategy must be part of feature design review." },
];

const SAMPLE_TEMPLATES: Template[] = [
  { id: "1", title: "Daily Status Report", subject: "[QA Status] {{Project}} - {{Date}}", body: "Hi Team,\n\nHere is the QA status update for {{Date}}:\n\n**Testing Progress:**\n- Total Test Cases: {{total}}\n- Passed: {{passed}} ({{passRate}}%)\n- Failed: {{failed}}\n- Blocked: {{blocked}}\n\n**Defects Summary:**\n- New: {{newDefects}}\n- Resolved: {{resolved}}\n- Open Critical: {{critical}}\n\n**Blockers:**\n{{blockers}}\n\n**Plan for Tomorrow:**\n{{plan}}\n\nRegards,\n{{name}}", category: "daily-status", isFavorite: true },
  { id: "2", title: "Bug Follow-up", subject: "Follow-up: {{BugID}} - {{Summary}}", body: "Hi {{DevName}},\n\nFollowing up on {{BugID}} - \"{{Summary}}\" which was reported on {{Date}}.\n\nCurrent Status: {{Status}}\nSeverity: {{Severity}}\n\nCould you please provide an update on the fix timeline? This is blocking our {{TestSuite}} test execution.\n\nAttached: Test evidence and reproduction steps.\n\nThanks,\n{{QAName}}", category: "follow-up", isFavorite: true },
  { id: "3", title: "Critical Bug Escalation", subject: "⚠️ ESCALATION: Critical Bug {{BugID}} Blocking Release", body: "Hi {{Manager}},\n\nI am escalating the following critical issue that is blocking the {{Release}} release:\n\n**Bug:** {{BugID}} - {{Summary}}\n**Severity:** Critical\n**Impact:** {{Impact}}\n**Reported:** {{Date}}\n**Assigned To:** {{DevName}}\n\n**Current Status:** {{Status}}\n\nThis issue needs immediate attention as it is blocking {{TestScenarios}} critical test scenarios.\n\n**Request:** Please prioritize this fix for the current sprint.\n\nRegards,\n{{QAName}}", category: "escalation", isFavorite: false },
  { id: "4", title: "Environment Issues Alert", subject: "[ENV ISSUE] {{Environment}} - {{IssueType}}", body: "Hi DevOps Team,\n\nWe are experiencing the following environment issue on {{Environment}}:\n\n**Issue:** {{IssueDescription}}\n**Started:** {{StartTime}}\n**Impact:** QA testing is blocked for {{AffectedTeams}}\n\n**Error Details:**\n```\n{{ErrorLog}}\n```\n\n**Steps Already Tried:**\n{{TroubleshootingSteps}}\n\nPlease assist at the earliest.\n\nThanks,\n{{QAName}}", category: "env-issues", isFavorite: false },
  { id: "5", title: "Release Sign-off", subject: "✅ QA Sign-off: {{Release}} - {{Environment}}", body: "Hi All,\n\n**QA Sign-off for {{Release}} on {{Environment}}**\n\n**Testing Summary:**\n- Test Cases Executed: {{executed}}/{{total}}\n- Pass Rate: {{passRate}}%\n- Critical Defects: 0 open\n- Major Defects: {{major}} (accepted risk)\n\n**Scope Covered:**\n{{testScope}}\n\n**Known Issues:**\n{{knownIssues}}\n\n**Decision: GO FOR RELEASE** ✅\n\nQA team approves release to {{TargetEnv}}.\n\nRegards,\n{{QALead}}", category: "release-signoff", isFavorite: true },
  { id: "6", title: "Sprint Test Summary", subject: "[QA Report] Sprint {{Sprint}} Test Execution Summary", body: "Hi Team,\n\nPlease find the Sprint {{Sprint}} QA execution summary:\n\n**Test Metrics:**\n| Metric | Count |\n|--------|-------|\n| Total TCs | {{total}} |\n| Executed | {{executed}} |\n| Passed | {{passed}} |\n| Failed | {{failed}} |\n| Skipped | {{skipped}} |\n\n**Automation Coverage:** {{automationCoverage}}%\n\nFull report: {{reportLink}}\n\nRegards,\n{{QAName}}", category: "daily-status", isFavorite: false },
];

const SAMPLE_MEETINGS: Meeting[] = [
  { id: "1", title: "Sprint 24 Planning", date: "2026-06-30", time: "10:00 AM", type: "planning", attendees: ["You", "Rahul (PM)", "Arjun (Dev)", "Priya (Dev)", "Sneha (Dev)"], notes: "Sprint 24 runs July 1–14. Focus on E-Commerce v3.2 checkout revamp and Auth Service hardening.", actionItems: ["Prepare test plan for checkout revamp", "Review Auth Service test cases with dev team", "Set up test environment by EOD July 1"], status: "upcoming" },
  { id: "2", title: "Daily Standup", date: "2026-06-27", time: "09:30 AM", type: "standup", attendees: ["You", "Arjun (Dev)", "Priya (Dev)", "Rahul (PM)"], notes: "Blockers: Staging environment down. BUG-1042 critical — escalated.", actionItems: ["Follow up with DevOps on staging env", "Retest BUG-1038 fix by EOD"], status: "upcoming" },
  { id: "3", title: "Release Review — E-Commerce v3.2", date: "2026-07-05", time: "02:00 PM", type: "review", attendees: ["You", "Rahul (PM)", "Arjun (Dev)", "Kiran (DevOps)", "Manager"], notes: "", actionItems: ["Prepare test metrics report", "List all known issues with severity", "Demo critical flows"], status: "upcoming" },
  { id: "4", title: "Sprint 23 Retrospective", date: "2026-06-26", time: "04:00 PM", type: "retrospective", attendees: ["You", "Rahul (PM)", "Arjun (Dev)", "Priya (Dev)"], notes: "What went well: Early defect detection on auth module. What to improve: Test environment stability — need a dedicated QA env. Action: DevOps to provision dedicated QA instance.", actionItems: ["Document retrospective learnings in KB", "Share env request with DevOps"], status: "completed" },
  { id: "5", title: "QA + Dev Sync — Payment Integration", date: "2026-06-25", time: "11:00 AM", type: "standup", attendees: ["You", "Arjun (Dev)", "Priya (Dev)"], notes: "Reviewed Stripe v4 migration scope. 14 new test scenarios identified for the payment gateway.", actionItems: ["Write 14 new Stripe test cases", "Add to regression suite"], status: "completed" },
];

const SAMPLE_KB: KBEntry[] = [
  { id: "1", title: "Production DB Read-Only Queries", content: "-- Get user order history\nSELECT u.email, o.id, o.total, o.status\nFROM users u JOIN orders o ON u.id = o.user_id\nWHERE u.email = 'test@example.com'\nORDER BY o.created_at DESC;\n\n-- Check active sessions\nSELECT * FROM sessions WHERE expires_at > NOW();", category: "sql", tags: ["production", "orders", "users"], updatedAt: "2026-06-20", isFavorite: true },
  { id: "2", title: "Staging Environment Credentials", content: "Staging URL: https://staging.ecommerce-app.internal\n\nTest Accounts:\n- Admin: admin@qa-test.com / TestAdmin@2024\n- User: buyer@qa-test.com / TestBuyer@2024\n- Guest checkout: No account needed\n\nDB Connection (Read-only):\nHost: staging-db.internal:5432\nDB: ecommerce_staging\nUser: qa_readonly / QARead@2024", category: "environments", tags: ["staging", "credentials", "db"], updatedAt: "2026-06-22", isFavorite: true },
  { id: "3", title: "Checkout Flow Test Scenarios", content: "Happy Path\n1. Add item to cart → checkout → pay → confirm\n2. Apply valid coupon code\n3. Guest checkout flow\n4. Saved address checkout\n\nEdge Cases\n- Cart with 50+ items\n- Multiple coupons (currently broken — BUG-1042)\n- International shipping addresses\n- Payment retry after failure\n\nNegative Tests\n- Invalid coupon codes\n- Expired card\n- Insufficient stock at checkout", category: "test-data", tags: ["checkout", "e-commerce", "scenarios"], updatedAt: "2026-06-25", isFavorite: false },
  { id: "4", title: "Playwright Setup & Troubleshooting", content: "Installation\nnpx playwright install --with-deps\n\nCommon Issues\n\nTests fail on CI but pass locally:\n- Check headless mode settings\n- Ensure correct BASE_URL env var\n- Increase timeout for slow CI runners\n\nBrowser not found:\nnpx playwright install chromium\n\nUseful Commands\nnpx playwright test --debug\nnpx playwright codegen https://staging.app.com\nnpx playwright show-report", category: "troubleshooting", tags: ["playwright", "automation", "ci"], updatedAt: "2026-06-18", isFavorite: false },
  { id: "5", title: "Sprint 23 Release Notes — Auth Service 2.1", content: "Auth Service 2.1 — Released 2026-06-15\n\nNew Features\n- Three-tier permission system (Viewer/Editor/Admin)\n- OAuth 2.0 PKCE flow\n- Session management dashboard\n\nBug Fixes\n- Fixed silent token refresh failure on Safari (BUG-1031)\n- Resolved rate limiting false positives\n\nKnown Issues\n- Mobile Safari OAuth still requires manual re-login after token expiry\n\nTest Coverage: 94% (238/253 test cases passed)", category: "release-notes", tags: ["auth", "release", "sprint-23"], updatedAt: "2026-06-15", isFavorite: false },
  { id: "6", title: "ISTQB — Test Design Techniques", content: "Equivalence Partitioning\nDivide inputs into partitions where behavior is the same.\nExample: Age field (0-17, 18-65, 66+)\n\nBoundary Value Analysis\nTest at boundaries of partitions.\nExample: Age 17, 18, 65, 66\n\nDecision Table Testing\nCapture combinations of conditions and resulting actions.\nBest for: Business rules with multiple conditions.\n\nState Transition Testing\nModel system as states and transitions.\nBest for: Login flows, order status machines.", category: "learning", tags: ["istqb", "theory", "design-techniques"], updatedAt: "2026-06-10", isFavorite: true },
];

const SAMPLE_PROJECTS: Project[] = [
  { id: "1", name: "E-Commerce v3.2", status: "active", progress: 67, totalTests: 342, passedTests: 229, failedTests: 18, blockedTests: 12, defectsOpen: 4, defectsClosed: 23, releaseDate: "2026-07-15", version: "3.2.0", description: "Major checkout revamp with Stripe v4 integration, new discount engine, and performance improvements." },
  { id: "2", name: "Auth Service 2.1", status: "completed", progress: 100, totalTests: 253, passedTests: 238, failedTests: 0, blockedTests: 0, defectsOpen: 0, defectsClosed: 15, releaseDate: "2026-06-15", version: "2.1.0", description: "Three-tier RBAC system with OAuth 2.0 PKCE and improved session management." },
  { id: "3", name: "Analytics Dashboard", status: "active", progress: 45, totalTests: 187, passedTests: 84, failedTests: 12, blockedTests: 8, defectsOpen: 3, defectsClosed: 7, releaseDate: "2026-08-01", version: "1.3.0", description: "New visualization engine, CSV export improvements, and real-time dashboard updates." },
  { id: "4", name: "Mobile App v2.0", status: "planning", progress: 10, totalTests: 0, passedTests: 0, failedTests: 0, blockedTests: 0, defectsOpen: 0, defectsClosed: 0, releaseDate: "2026-09-30", version: "2.0.0", description: "Complete React Native rewrite with offline support and biometric authentication." },
];

const SAMPLE_ACTIVITIES: ActivityEntry[] = [
  { id: "1", action: "Defect reported", module: "Defects", timestamp: "2026-06-27 09:45", details: "BUG-1055 — Search autocomplete returns stale results after profile update" },
  { id: "2", action: "Task completed", module: "Tasks", timestamp: "2026-06-26 17:30", details: "Review automation script for login flow marked as done" },
  { id: "3", action: "Template created", module: "Mail Templates", timestamp: "2026-06-26 14:20", details: "Added \"Sprint Test Summary\" template to Mail Templates" },
  { id: "4", action: "KB entry updated", module: "Knowledge Base", timestamp: "2026-06-25 11:10", details: "Updated \"Checkout Flow Test Scenarios\" with new edge cases" },
  { id: "5", action: "Meeting notes saved", module: "Meetings", timestamp: "2026-06-25 10:30", details: "MOM saved for QA + Dev Sync — Payment Integration" },
  { id: "6", action: "Defect resolved", module: "Defects", timestamp: "2026-06-24 16:45", details: "BUG-1031 marked as resolved by Dev team" },
  { id: "7", action: "Task added", module: "Tasks", timestamp: "2026-06-24 09:00", details: "Added \"Cross-browser compatibility check\" to task backlog" },
  { id: "8", action: "Project updated", module: "Projects", timestamp: "2026-06-23 15:30", details: "E-Commerce v3.2 testing progress updated to 67%" },
  { id: "9", action: "Defect escalated", module: "Defects", timestamp: "2026-06-23 13:15", details: "BUG-1038 assigned to Priya Nair, status set to In Progress" },
  { id: "10", action: "KB entry created", module: "Knowledge Base", timestamp: "2026-06-22 10:00", details: "Added \"Staging Environment Credentials\" to Knowledge Base" },
];

const AUTOMATION_COVERAGE = [
  { module: "Authentication", automated: 94, total: 48 },
  { module: "Checkout", automated: 62, total: 89 },
  { module: "Product Catalog", automated: 78, total: 64 },
  { module: "User Profile", automated: 85, total: 41 },
  { module: "Payment", automated: 71, total: 52 },
  { module: "Orders", automated: 55, total: 73 },
  { module: "Analytics", automated: 30, total: 45 },
];

const EXECUTION_TREND = [
  { date: "Jun 21", passed: 198, failed: 12 },
  { date: "Jun 22", passed: 205, failed: 15 },
  { date: "Jun 23", passed: 212, failed: 10 },
  { date: "Jun 24", passed: 220, failed: 8 },
  { date: "Jun 25", passed: 229, failed: 18 },
  { date: "Jun 26", passed: 223, failed: 14 },
  { date: "Jun 27", passed: 231, failed: 11 },
];

// ─── Utility Components ───────────────────────────────────────────────────────

const priorityCfg: Record<Priority, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  high: { label: "High", cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
  medium: { label: "Medium", cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  low: { label: "Low", cls: "bg-slate-500/20 text-slate-400 border border-slate-500/30" },
};
const severityCfg: Record<Severity, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  major: { label: "Major", cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
  minor: { label: "Minor", cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  trivial: { label: "Trivial", cls: "bg-slate-500/20 text-slate-400 border border-slate-500/30" },
};
const taskStatusCfg: Record<TaskStatus, { label: string; cls: string }> = {
  "todo": { label: "To Do", cls: "bg-slate-500/20 text-slate-400 border border-slate-500/30" },
  "in-progress": { label: "In Progress", cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  "blocked": { label: "Blocked", cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  "done": { label: "Done", cls: "bg-green-500/20 text-green-400 border border-green-500/30" },
};
const defectStatusCfg: Record<DefectStatus, { label: string; cls: string }> = {
  "open": { label: "Open", cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
  "in-progress": { label: "In Progress", cls: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  "resolved": { label: "Resolved", cls: "bg-green-500/20 text-green-400 border border-green-500/30" },
  "closed": { label: "Closed", cls: "bg-slate-500/20 text-slate-400 border border-slate-500/30" },
  "reopened": { label: "Reopened", cls: "bg-orange-500/20 text-orange-400 border border-orange-500/30" },
};

function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${className}`}>{children}</span>;
}
function PBadge({ p }: { p: Priority }) { const c = priorityCfg[p]; return <Badge className={c.cls}>{c.label}</Badge>; }
function SBadge({ s }: { s: Severity }) { const c = severityCfg[s]; return <Badge className={c.cls}>{c.label}</Badge>; }
function TSBadge({ s }: { s: TaskStatus }) { const c = taskStatusCfg[s]; return <Badge className={c.cls}>{c.label}</Badge>; }
function DSBadge({ s }: { s: DefectStatus }) { const c = defectStatusCfg[s]; return <Badge className={c.cls}>{c.label}</Badge>; }

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-card rounded-xl border border-border ${onClick ? "cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}
function KPI({ label, value, sub, color = "text-foreground" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <Card className="p-4">
      <div className="text-[11px] text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-semibold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const NAV: { id: NavItem; label: string; Icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", Icon: CheckSquare },
  { id: "knowledge", label: "Knowledge Base", Icon: BookOpen },
  { id: "templates", label: "Mail Templates", Icon: Mail },
  { id: "meetings", label: "Meetings", Icon: Calendar },
  { id: "defects", label: "Defects", Icon: Bug },
  { id: "projects", label: "Projects & Releases", Icon: FolderKanban },
  { id: "automation", label: "Automation Hub", Icon: Cpu },
  { id: "activity", label: "Activity Log", Icon: Activity },
];

function Sidebar({ active, onNav, collapsed, onToggle }: { active: NavItem; onNav: (id: NavItem) => void; collapsed: boolean; onToggle: () => void }) {
  return (
    <aside className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 flex-shrink-0 ${collapsed ? "w-[60px]" : "w-[220px]"}`}>
      <div className={`flex items-center gap-2.5 h-14 border-b border-sidebar-border px-4 flex-shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Bug className="w-3.5 h-3.5 text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-[13px] font-semibold text-sidebar-foreground leading-tight">QA Workspace</div>
            <div className="text-[10px] text-muted-foreground">Personal Edition</div>
          </div>
        )}
      </div>
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ id, label, Icon }) => {
          const active_ = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-2.5 py-2 text-[13px] font-medium transition-colors relative ${collapsed ? "justify-center px-0" : "px-4"} ${active_ ? "text-indigo-400 bg-indigo-600/10" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"}`}
            >
              {active_ && <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-indigo-500 rounded-r-full" />}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ dark, onToggleDark, searchQuery, onSearch, onQuickAdd }: {
  dark: boolean; onToggleDark: () => void; searchQuery: string; onSearch: (q: string) => void; onQuickAdd: () => void;
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifs = [
    { text: "BUG-1042 still unresolved — release in 18 days", dot: "bg-red-500", time: "10 min ago" },
    { text: "Sprint 24 Planning tomorrow at 10:00 AM", dot: "bg-yellow-500", time: "1h ago" },
    { text: "BUG-1031 marked resolved by Ravi Shankar", dot: "bg-green-500", time: "2h ago" },
  ];
  return (
    <header className="h-14 bg-background border-b border-border flex items-center gap-3 px-5 flex-shrink-0">
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search tasks, defects, notes…"
          className="w-full bg-accent/60 border border-border rounded-lg pl-8 pr-4 py-1.5 text-[13px] text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/40 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => onSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Quick Add
        </button>
        <button onClick={onToggleDark} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setNotifOpen(v => !v); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-10 w-72 bg-popover border border-border rounded-xl shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-4 py-2.5 border-b border-border text-[13px] font-semibold">Notifications</div>
              {notifs.map((n, i) => (
                <div key={i} className="px-4 py-3 hover:bg-accent/50 flex items-start gap-3 cursor-pointer border-b border-border last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                  <div>
                    <div className="text-xs text-foreground">{n.text}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">QA</div>
      </div>
    </header>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ tasks, defects, meetings, projects, templates, activities }: {
  tasks: Task[]; defects: Defect[]; meetings: Meeting[]; projects: Project[]; templates: Template[]; activities: ActivityEntry[];
}) {
  const active = projects.find(p => p.status === "active") || projects[0];
  const openDefects = defects.filter(d => d.status === "open" || d.status === "reopened");
  const todayTasks = tasks.filter(t => t.status !== "done").slice(0, 5);
  const upcomingMtgs = meetings.filter(m => m.status === "upcoming").slice(0, 3);
  const favTemplates = templates.filter(t => t.isFavorite);
  const daysLeft = Math.ceil((new Date(active.releaseDate).getTime() - Date.now()) / 86400000);

  return (
    <div className="p-6 space-y-5 overflow-y-auto">
      <div>
        <h1 className="text-xl font-semibold">Good morning 👋</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Friday, June 27, 2026 · {tasks.filter(t => t.status !== "done").length} tasks pending</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Open Defects" value={openDefects.length} sub="2 critical" color="text-red-400" />
        <KPI label="Pending Tasks" value={tasks.filter(t => t.status !== "done").length} sub="2 due today" color="text-blue-400" />
        <KPI label="Pass Rate" value={`${Math.round((active.passedTests / active.totalTests) * 100)}%`} sub={`${active.passedTests}/${active.totalTests} tests`} color="text-green-400" />
        <KPI label="Release In" value={`${daysLeft}d`} sub={active.releaseDate} color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Project */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Active Project</div>
              <h3 className="text-base font-semibold">{active.name}</h3>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">Active</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{active.description}</p>
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Testing Progress</span>
              <span className="font-semibold font-mono">{active.progress}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${active.progress}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { l: "Passed", v: active.passedTests, c: "text-green-400" },
              { l: "Failed", v: active.failedTests, c: "text-red-400" },
              { l: "Blocked", v: active.blockedTests, c: "text-yellow-400" },
              { l: "Open Bugs", v: active.defectsOpen, c: "text-orange-400" },
            ].map(s => (
              <div key={s.l} className="text-center p-2.5 bg-muted/60 rounded-lg">
                <div className={`text-lg font-semibold font-mono ${s.c}`}>{s.v}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Release Snapshot */}
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Release Snapshot</div>
          {projects.filter(p => p.status === "active").map(p => (
            <div key={p.id} className="mb-3 p-3 bg-muted/60 rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[13px] font-medium">{p.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">v{p.version}</span>
              </div>
              <div className="text-[11px] text-muted-foreground mb-2">{p.releaseDate}</div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span className="text-[12px] font-semibold">{daysLeft} days to release</span>
            </div>
            <div className="text-[11px] text-muted-foreground">2 critical bugs unresolved</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's Tasks */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Today&apos;s Tasks</div>
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30">{todayTasks.length}</Badge>
          </div>
          <div className="space-y-2">
            {todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors group">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.priority === "critical" ? "bg-red-400" : t.priority === "high" ? "bg-orange-400" : "bg-yellow-400"}`} />
                <span className="text-xs flex-1 truncate">{t.title}</span>
                <TSBadge s={t.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Meetings */}
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Upcoming Meetings</div>
          <div className="space-y-3">
            {upcomingMtgs.map(m => (
              <div key={m.id} className="flex items-start gap-3 p-2.5 bg-muted/60 rounded-lg">
                <div className="text-center min-w-[36px]">
                  <div className="text-[12px] font-semibold text-indigo-400 font-mono">{m.time.split(" ")[0]}</div>
                  <div className="text-[9px] text-muted-foreground">{m.time.split(" ")[1]}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-medium truncate">{m.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{m.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Open Defects */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Open Defects</div>
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">{openDefects.length}</Badge>
          </div>
          <div className="space-y-2">
            {openDefects.slice(0, 4).map(d => (
              <div key={d.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors">
                <SBadge s={d.severity} />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-mono text-indigo-400">{d.defectId}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{d.summary}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Favorite Templates */}
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Favorite Templates</div>
          <div className="space-y-2">
            {favTemplates.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2.5 bg-muted/60 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                <div className="min-w-0 flex-1 mr-2">
                  <div className="text-[12px] font-medium">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate font-mono">{t.subject}</div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded-md" onClick={() => navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`)}>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Recent Activity</div>
          <div className="relative pl-4">
            <div className="absolute left-[5px] top-1 bottom-1 w-px bg-border" />
            <div className="space-y-3">
              {activities.slice(0, 5).map((a) => (
                <div key={a.id} className="relative">
                  <div className="absolute -left-[11px] w-2.5 h-2.5 rounded-full bg-background border-2 border-indigo-500 top-0.5" />
                  <div className="text-[12px] font-medium">{a.action}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{a.details}</div>
                  <div className="text-[9px] text-muted-foreground/60 mt-0.5 font-mono">{a.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Tasks Page ───────────────────────────────────────────────────────────────

function TasksPage({ tasks, onAdd, onUpdate }: { tasks: Task[]; onAdd: (t: Omit<Task, "id">) => void; onUpdate: (id: string, u: Partial<Task>) => void }) {
  const [selected, setSelected] = useState<Task | null>(null);
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState<Partial<Task>>({ priority: "medium", status: "todo", project: "E-Commerce v3.2" });
  const filtered = filter === "all" ? tasks : tasks.filter(t => t.status === filter);

  const statusNext: Record<TaskStatus, TaskStatus> = { todo: "in-progress", "in-progress": "done", blocked: "in-progress", done: "todo" };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold">Tasks</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{tasks.filter(t => t.status !== "done").length} active tasks</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["all", "todo", "in-progress", "blocked", "done"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-indigo-600 text-white" : "bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Title", "Priority", "Status", "Project", "Due Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)} className={`border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors ${selected?.id === t.id ? "bg-indigo-600/8" : ""}`}>
                  <td className="px-4 py-3 text-[13px] font-medium">{t.title}</td>
                  <td className="px-4 py-3"><PBadge p={t.priority} /></td>
                  <td className="px-4 py-3"><TSBadge s={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.project}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{t.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {selected && (
        <div className="w-72 border-l border-border bg-card p-5 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold">Task Details</span>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <p className="text-[13px] font-medium mb-4 leading-snug">{selected.title}</p>
          <div className="space-y-2.5 mb-4">
            {[
              { label: "Priority", el: <PBadge p={selected.priority} /> },
              { label: "Status", el: <TSBadge s={selected.status} /> },
              { label: "Project", el: <span className="text-xs">{selected.project}</span> },
              { label: "Due", el: <span className="text-xs font-mono">{selected.dueDate}</span> },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground w-14 flex-shrink-0">{row.label}</span>
                {row.el}
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border mb-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">Description</div>
            <p className="text-xs text-muted-foreground leading-relaxed">{selected.description}</p>
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {selected.tags.map(tag => <span key={tag} className="text-[10px] bg-accent px-2 py-0.5 rounded-md text-muted-foreground">#{tag}</span>)}
          </div>
          <button
            onClick={() => { const next = { ...selected, status: statusNext[selected.status] }; onUpdate(selected.id, { status: next.status }); setSelected(next); }}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Advance Status
          </button>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">Add Task</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
                <input className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Task title…" value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Priority</label>
                  <select className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none" value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Priority })}>
                    {(["critical", "high", "medium", "low"] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Due Date</label>
                  <input type="date" className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none" value={draft.dueDate || ""} onChange={e => setDraft({ ...draft, dueDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Project</label>
                <select className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none" value={draft.project} onChange={e => setDraft({ ...draft, project: e.target.value })}>
                  {SAMPLE_PROJECTS.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <textarea rows={3} className="w-full bg-accent/50 border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none resize-none" placeholder="Task details…" value={draft.description || ""} onChange={e => setDraft({ ...draft, description: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-accent/60 hover:bg-accent rounded-lg text-[13px] transition-colors">Cancel</button>
              <button
                onClick={() => {
                  if (draft.title) {
                    onAdd({ title: draft.title, priority: draft.priority || "medium", status: "todo", dueDate: draft.dueDate || "", project: draft.project || SAMPLE_PROJECTS[0].name, description: draft.description || "", tags: [] });
                    setShowAdd(false);
                    setDraft({ priority: "medium", status: "todo", project: "E-Commerce v3.2" });
                  }
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors"
              >Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Knowledge Base ───────────────────────────────────────────────────────────

const KB_CAT: Record<string, { label: string; color: string }> = {
  "test-data": { label: "Test Data", color: "bg-blue-500/20 text-blue-400" },
  "sql": { label: "SQL Queries", color: "bg-purple-500/20 text-purple-400" },
  "troubleshooting": { label: "Troubleshooting", color: "bg-orange-500/20 text-orange-400" },
  "environments": { label: "Environments", color: "bg-green-500/20 text-green-400" },
  "learning": { label: "Learning Notes", color: "bg-pink-500/20 text-pink-400" },
  "release-notes": { label: "Release Notes", color: "bg-cyan-500/20 text-cyan-400" },
};

function KnowledgeBasePage({ entries }: { entries: KBEntry[] }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [selected, setSelected] = useState<KBEntry | null>(null);

  const filtered = entries.filter(e => {
    const mc = cat === "all" || e.category === cat;
    const ms = !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-44 border-r border-border p-4 flex-shrink-0 overflow-y-auto">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Categories</div>
        <button onClick={() => setCat("all")} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs mb-1 transition-colors ${cat === "all" ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
          All ({entries.length})
        </button>
        {Object.entries(KB_CAT).map(([key, cfg]) => (
          <button key={key} onClick={() => setCat(key)} className={`w-full text-left px-2 py-1.5 rounded-lg text-xs mb-1 transition-colors ${cat === key ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
            {cfg.label} ({entries.filter(e => e.category === key).length})
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-semibold">Knowledge Base</h1>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input className="w-full bg-accent/50 border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/60" placeholder="Search notes…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(e => {
            const cfg = KB_CAT[e.category];
            return (
              <Card key={e.id} onClick={() => setSelected(selected?.id === e.id ? null : e)} className={`p-4 hover:border-indigo-500/40 transition-colors ${selected?.id === e.id ? "border-indigo-500/50 bg-indigo-600/5" : ""}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-[13px] font-medium flex-1 mr-2 leading-snug">{e.title}</h4>
                  {e.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{e.content.replace(/[\n]/g, " ").trim()}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-1 flex-wrap">
                    {e.tags.slice(0, 3).map(tag => <span key={tag} className="text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground">#{tag}</span>)}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{e.updatedAt}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="w-72 border-l border-border bg-card p-5 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${KB_CAT[selected.category].color}`}>{KB_CAT[selected.category].label}</span>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <h3 className="text-[13px] font-semibold mb-3 leading-snug">{selected.title}</h3>
          <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-accent/50 p-3 rounded-lg overflow-x-auto max-h-80 overflow-y-auto">{selected.content}</pre>
          <div className="mt-3 flex flex-wrap gap-1">
            {selected.tags.map(tag => <span key={tag} className="text-[10px] bg-accent px-2 py-0.5 rounded text-muted-foreground">#{tag}</span>)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-3 font-mono">Updated: {selected.updatedAt}</div>
        </div>
      )}
    </div>
  );
}

// ─── Mail Templates ───────────────────────────────────────────────────────────

const TMPL_CAT: Record<string, { label: string; color: string }> = {
  "daily-status": { label: "Daily Status", color: "bg-blue-500/20 text-blue-400" },
  "follow-up": { label: "Follow-up", color: "bg-green-500/20 text-green-400" },
  "escalation": { label: "Escalation", color: "bg-red-500/20 text-red-400" },
  "env-issues": { label: "Env Issues", color: "bg-orange-500/20 text-orange-400" },
  "release-signoff": { label: "Release Sign-off", color: "bg-purple-500/20 text-purple-400" },
};

function MailTemplatesPage({ templates }: { templates: Template[] }) {
  const [preview, setPreview] = useState<Template | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (t: Template) => {
    navigator.clipboard.writeText(`Subject: ${t.subject}\n\n${t.body}`);
    setCopied(t.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Mail Templates</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{templates.length} templates · {templates.filter(t => t.isFavorite).length} favorites</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Template
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {Object.entries(TMPL_CAT).map(([k, c]) => <span key={k} className={`text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer ${c.color}`}>{c.label}</span>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t => {
          const cfg = TMPL_CAT[t.category];
          return (
            <Card key={t.id} className="p-4 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.color}`}>{cfg.label}</span>
                {t.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
              </div>
              <h4 className="text-[13px] font-semibold mb-2">{t.title}</h4>
              <div className="bg-accent/50 rounded-lg p-2.5 mb-3">
                <div className="text-[10px] text-muted-foreground mb-0.5">Subject</div>
                <div className="text-[11px] font-mono truncate">{t.subject}</div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{t.body.replace(/[*#\n`]/g, " ").replace(/\s+/g, " ").trim()}</p>
              <div className="flex gap-2">
                <button onClick={() => copy(t)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${copied === t.id ? "bg-green-500/20 text-green-400" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}>
                  {copied === t.id ? <><CheckCircle className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
                <button onClick={() => setPreview(t)} className="px-3 py-1.5 bg-accent/60 hover:bg-accent rounded-lg text-xs transition-colors">Preview</button>
              </div>
            </Card>
          );
        })}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-xl max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{preview.title}</h3>
              <button onClick={() => setPreview(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="bg-accent/50 rounded-lg p-3 mb-3">
              <span className="text-xs text-muted-foreground">Subject: </span>
              <span className="text-xs font-mono">{preview.subject}</span>
            </div>
            <pre className="text-xs text-foreground leading-relaxed whitespace-pre-wrap font-mono bg-accent/50 p-3 rounded-lg">{preview.body}</pre>
            <button onClick={() => copy(preview)} className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors">
              {copied === preview.id ? "Copied!" : "Copy Template"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Meetings ─────────────────────────────────────────────────────────────────

const MTG_ICONS: Record<string, string> = { standup: "🔄", review: "🔍", planning: "📋", retrospective: "🔁", demo: "🎯" };

function MeetingsPage({ meetings }: { meetings: Meeting[] }) {
  const [tab, setTab] = useState<"upcoming" | "mom" | "actions">("upcoming");
  const [detail, setDetail] = useState<Meeting | null>(null);
  const upcoming = meetings.filter(m => m.status === "upcoming");
  const completed = meetings.filter(m => m.status === "completed");
  const allActions = meetings.flatMap(m => m.actionItems.map(a => ({ action: a, meeting: m.title, date: m.date })));

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Meetings</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors"><Plus className="w-4 h-4" /> Schedule</button>
      </div>
      <div className="flex gap-1.5 mb-6">
        {(["upcoming", "mom", "actions"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${tab === t ? "bg-indigo-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
            {t === "mom" ? "Minutes of Meeting" : t === "actions" ? "Action Items" : "Upcoming"}
          </button>
        ))}
      </div>

      {tab === "upcoming" && (
        <div className="space-y-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Next 7 Days</div>
          {upcoming.map(m => (
            <Card key={m.id} onClick={() => setDetail(m)} className="p-4 hover:border-indigo-500/40 transition-colors">
              <div className="flex items-start gap-4">
                <span className="text-2xl">{MTG_ICONS[m.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-[13px] font-semibold">{m.title}</h4>
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono text-[10px]">{m.date}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>🕐 {m.time}</span>
                    <span>👥 {m.attendees.length} attendees</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.attendees.slice(0, 4).map(a => <span key={a} className="text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground">{a}</span>)}
                    {m.attendees.length > 4 && <span className="text-[10px] bg-accent px-1.5 py-0.5 rounded text-muted-foreground">+{m.attendees.length - 4}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "mom" && (
        <div className="space-y-4">
          {completed.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span>{MTG_ICONS[m.type]}</span>
                <h4 className="text-[13px] font-semibold">{m.title}</h4>
                <span className="text-xs text-muted-foreground font-mono ml-auto">{m.date} · {m.time}</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed mb-3">{m.notes}</p>
              {m.actionItems.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Action Items</div>
                  <ul className="space-y-1.5">
                    {m.actionItems.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "actions" && (
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Action Item", "Meeting", "Date", "Status"].map(h => <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {allActions.map((a, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-3 text-xs">{a.action}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{a.meeting}</td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{a.date}</td>
                  <td className="px-4 py-3"><Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Pending</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {detail && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-popover border border-border rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{detail.title}</h3>
              <button onClick={() => setDetail(null)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground mb-4">
              <span>📅 {detail.date}</span><span>🕐 {detail.time}</span>
            </div>
            <div className="mb-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Attendees</div>
              <div className="flex flex-wrap gap-1.5">{detail.attendees.map(a => <span key={a} className="text-xs bg-accent px-2 py-0.5 rounded">{a}</span>)}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Preparation Notes</div>
              <ul className="space-y-1.5">
                {detail.actionItems.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs bg-accent/50 p-2 rounded-lg"><Clock className="w-3.5 h-3.5 text-indigo-400 mt-0.5 flex-shrink-0" />{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Defects ──────────────────────────────────────────────────────────────────

function DefectsPage({ defects }: { defects: Defect[] }) {
  const [selected, setSelected] = useState<Defect | null>(null);
  const [filter, setFilter] = useState<"all" | DefectStatus>("all");
  const filtered = filter === "all" ? defects : defects.filter(d => d.status === filter);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-semibold">Defects</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">{defects.filter(d => d.status === "open").length} open · {defects.filter(d => d.severity === "critical").length} critical</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[13px] font-semibold transition-colors"><Plus className="w-4 h-4" /> Report Defect</button>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(["all", "open", "in-progress", "resolved", "closed", "reopened"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${filter === f ? "bg-indigo-600 text-white" : "bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
              {f === "all" ? "All" : f.replace("-", " ")}
            </button>
          ))}
        </div>
        <Card className="overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Defect ID", "Summary", "Severity", "Status", "Project", "Reported"].map(h => <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => setSelected(selected?.id === d.id ? null : d)} className={`border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors ${selected?.id === d.id ? "bg-red-600/5" : ""}`}>
                  <td className="px-4 py-3 text-xs font-mono text-indigo-400 font-semibold">{d.defectId}</td>
                  <td className="px-4 py-3 text-[13px] font-medium max-w-xs">{d.summary}</td>
                  <td className="px-4 py-3"><SBadge s={d.severity} /></td>
                  <td className="px-4 py-3"><DSBadge s={d.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{d.project}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{d.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {selected && (
        <div className="w-72 border-l border-border bg-card p-5 overflow-y-auto flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-indigo-400 font-semibold">{selected.defectId}</span>
            <button onClick={() => setSelected(null)}><X className="w-4 h-4 text-muted-foreground hover:text-foreground" /></button>
          </div>
          <p className="text-[13px] font-semibold mb-3 leading-snug">{selected.summary}</p>
          <div className="flex gap-2 mb-4"><SBadge s={selected.severity} /><DSBadge s={selected.status} /></div>
          <div className="text-xs text-muted-foreground mb-4">{selected.project} · {selected.assignee}</div>
          <div className="space-y-4">
            {[
              { label: "Root Cause Analysis", text: selected.rca, cls: "bg-accent/50" },
              { label: "Workaround", text: selected.workaround, cls: "bg-accent/50" },
              { label: "Lessons Learned", text: selected.lessonsLearned, cls: "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300/80" },
            ].map(({ label, text, cls }) => (
              <div key={label}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1.5">{label}</div>
                <p className={`text-xs leading-relaxed p-3 rounded-lg ${cls}`}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Projects & Releases ──────────────────────────────────────────────────────

function ProjectsPage({ projects }: { projects: Project[] }) {
  const [sel, setSel] = useState<Project>(projects[0]);
  const statusCls: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border border-green-500/30",
    planning: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    completed: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    "on-hold": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  };

  const barData = sel.totalTests > 0 ? [
    { name: "Passed", v: sel.passedTests, fill: "#22c55e" },
    { name: "Failed", v: sel.failedTests, fill: "#ef4444" },
    { name: "Blocked", v: sel.blockedTests, fill: "#eab308" },
    { name: "Not Run", v: sel.totalTests - sel.passedTests - sel.failedTests - sel.blockedTests, fill: "#475569" },
  ] : [];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects & Releases</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[13px] font-semibold transition-colors"><Plus className="w-4 h-4" /> New Project</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {projects.map(p => (
          <Card key={p.id} onClick={() => setSel(p)} className={`p-4 hover:border-indigo-500/40 transition-colors ${sel.id === p.id ? "border-indigo-500/50 bg-indigo-600/5" : ""} ${p.status === "active" ? "ring-1 ring-indigo-500/20" : ""}`}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-[13px] font-semibold leading-snug flex-1 mr-2">{p.name}</h4>
              <Badge className={statusCls[p.status]}>{p.status}</Badge>
            </div>
            <div className="text-[11px] text-muted-foreground font-mono mb-3">v{p.version} · {p.releaseDate}</div>
            {p.totalTests > 0 ? (
              <>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Coverage</span>
                  <span className="font-semibold font-mono">{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                </div>
              </>
            ) : <div className="text-xs text-muted-foreground">Planning phase</div>}
          </Card>
        ))}
      </div>

      {sel.totalTests > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {[
            { l: "Total Tests", v: sel.totalTests, c: "text-foreground" },
            { l: "Passed", v: sel.passedTests, c: "text-green-400" },
            { l: "Failed", v: sel.failedTests, c: "text-red-400" },
            { l: "Blocked", v: sel.blockedTests, c: "text-yellow-400" },
            { l: "Open Bugs", v: sel.defectsOpen, c: "text-orange-400" },
            { l: "Closed Bugs", v: sel.defectsClosed, c: "text-slate-400" },
            { l: "Pass Rate", v: `${Math.round((sel.passedTests / sel.totalTests) * 100)}%`, c: "text-indigo-400" },
            { l: "Days to Release", v: `${Math.ceil((new Date(sel.releaseDate).getTime() - Date.now()) / 86400000)}d`, c: "text-cyan-400" },
          ].map(kpi => <KPI key={kpi.l} label={kpi.l} value={kpi.v} color={kpi.c} />)}
        </div>
      )}

      {barData.length > 0 && (
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">{sel.name} — Test Results</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: 12 }} />
              <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ─── Automation Hub ───────────────────────────────────────────────────────────

function AutomationHubPage() {
  const totalAuto = AUTOMATION_COVERAGE.reduce((s, m) => s + Math.round(m.total * m.automated / 100), 0);
  const totalAll = AUTOMATION_COVERAGE.reduce((s, m) => s + m.total, 0);
  const overall = Math.round((totalAuto / totalAll) * 100);

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-xl font-semibold">Automation Hub</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI label="Overall Coverage" value={`${overall}%`} sub={`${totalAuto}/${totalAll} tests`} color="text-indigo-400" />
        <KPI label="Automated Tests" value={totalAuto} sub="across 7 modules" color="text-green-400" />
        <KPI label="Pending Fixes" value="7" sub="flaky tests" color="text-yellow-400" />
        <KPI label="Last Run" value="2h ago" sub="231 passed, 11 failed" color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Execution Trend — 7 Days</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={EXECUTION_TREND}>
              <defs>
                <linearGradient id="gPass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "8px", fontSize: 11 }} />
              <Area type="monotone" dataKey="passed" stroke="#6366f1" strokeWidth={2} fill="url(#gPass)" name="Passed" />
              <Area type="monotone" dataKey="failed" stroke="#ef4444" strokeWidth={2} fill="url(#gFail)" name="Failed" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Module Coverage</div>
          <div className="space-y-3">
            {AUTOMATION_COVERAGE.map(m => (
              <div key={m.module}>
                <div className="flex justify-between text-xs mb-1">
                  <span>{m.module}</span>
                  <span className="font-mono text-muted-foreground">{m.automated}% <span className="text-muted-foreground/60">({Math.round(m.total * m.automated / 100)}/{m.total})</span></span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.automated >= 80 ? "bg-green-500" : m.automated >= 60 ? "bg-indigo-500" : m.automated >= 40 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${m.automated}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-4">Automation Learning Notes</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            { title: "Page Object Model", tag: "Design Pattern", body: "Organize test code by page. Each page class contains locators and actions for that page. Reduces duplication and improves maintainability significantly." },
            { title: "Handling Dynamic Elements", tag: "Best Practice", body: "Use explicit waits (waitForSelector) instead of fixed sleeps. Use aria-labels or data-testid attributes for stable, resilient selectors." },
            { title: "CI/CD Integration", tag: "DevOps", body: "Run smoke tests on every PR, full regression nightly. Use --reporter=html for artifacts. Store reports in CI artifacts for 30 days." },
          ].map(n => (
            <div key={n.title} className="bg-accent/50 rounded-lg p-3">
              <span className="text-[10px] bg-indigo-600/30 text-indigo-400 px-1.5 py-0.5 rounded font-semibold">{n.tag}</span>
              <div className="text-[13px] font-medium mt-2 mb-1">{n.title}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

const ACT_COLORS: Record<string, string> = {
  Defects: "bg-red-500/20 text-red-400",
  Tasks: "bg-blue-500/20 text-blue-400",
  "Mail Templates": "bg-purple-500/20 text-purple-400",
  "Knowledge Base": "bg-green-500/20 text-green-400",
  Meetings: "bg-cyan-500/20 text-cyan-400",
  Projects: "bg-orange-500/20 text-orange-400",
};

function ActivityLogPage({ activities }: { activities: ActivityEntry[] }) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const modules = ["all", ...Array.from(new Set(activities.map(a => a.module)))];
  const filtered = moduleFilter === "all" ? activities : activities.filter(a => a.module === moduleFilter);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold">Activity Log</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{activities.length} entries recorded</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-6">
        {modules.map(m => (
          <button key={m} onClick={() => setModuleFilter(m)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${moduleFilter === m ? "bg-indigo-600 text-white" : "bg-accent/50 text-muted-foreground hover:text-foreground"}`}>
            {m === "all" ? "All Modules" : m}
          </button>
        ))}
      </div>
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-3">
          {filtered.map(a => (
            <div key={a.id} className="relative">
              <div className="absolute -left-[23px] w-3 h-3 rounded-full bg-background border-2 border-indigo-500 top-2" />
              <Card className="p-3 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[13px] font-medium">{a.action}</span>
                      <Badge className={ACT_COLORS[a.module] || "bg-slate-500/20 text-slate-400"}>{a.module}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.details}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono flex-shrink-0 mt-0.5">{a.timestamp}</span>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [dark, setDark] = useState(true);
  const [nav, setNav] = useState<NavItem>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>(INIT_TASKS);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.fontFamily = "'Inter', system-ui, sans-serif";
  }, [dark]);

  const addTask = (t: Omit<Task, "id">) => setTasks(p => [{ ...t, id: String(Date.now()) }, ...p]);
  const updateTask = (id: string, u: Partial<Task>) => setTasks(p => p.map(t => t.id === id ? { ...t, ...u } : t));

  const renderPage = () => {
    switch (nav) {
      case "dashboard": return <Dashboard tasks={tasks} defects={SAMPLE_DEFECTS} meetings={SAMPLE_MEETINGS} projects={SAMPLE_PROJECTS} templates={SAMPLE_TEMPLATES} activities={SAMPLE_ACTIVITIES} />;
      case "tasks": return <TasksPage tasks={tasks} onAdd={addTask} onUpdate={updateTask} />;
      case "knowledge": return <KnowledgeBasePage entries={SAMPLE_KB} />;
      case "templates": return <MailTemplatesPage templates={SAMPLE_TEMPLATES} />;
      case "meetings": return <MeetingsPage meetings={SAMPLE_MEETINGS} />;
      case "defects": return <DefectsPage defects={SAMPLE_DEFECTS} />;
      case "projects": return <ProjectsPage projects={SAMPLE_PROJECTS} />;
      case "automation": return <AutomationHubPage />;
      case "activity": return <ActivityLogPage activities={SAMPLE_ACTIVITIES} />;
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Sidebar active={nav} onNav={setNav} collapsed={collapsed} onToggle={() => setCollapsed(v => !v)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header dark={dark} onToggleDark={() => setDark(v => !v)} searchQuery={search} onSearch={setSearch} onQuickAdd={() => setNav("tasks")} />
        <main className="flex-1 overflow-hidden" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.3) transparent" }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
