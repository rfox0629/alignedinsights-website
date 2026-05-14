export const intakeSections = [
  {
    id: "organization_profile",
    title: "Operating Profile",
    intro: "A few operating details we need for the deeper financial review.",
    fields: [
      { name: "fiscalYearEnd", label: "Fiscal year end", type: "text" },
      { name: "employeeCount", label: "Number of employees", type: "number" },
      { name: "contractorCount", label: "Number of contractors", type: "number" },
      {
        name: "transactionVolume",
        label: "Average monthly transaction volume",
        type: "select",
        options: ["Under 100", "100-250", "250-500", "500-1,000", "1,000+"],
      },
    ],
  },
  {
    id: "financial_systems",
    title: "Current Financial Systems",
    intro: "The systems and people currently supporting the financial rhythm.",
    fields: [
      { name: "accountingSoftware", label: "Current accounting software", type: "text" },
      { name: "payrollProvider", label: "Payroll provider", type: "text" },
      { name: "givingPlatform", label: "Giving/donor platform", type: "text" },
      { name: "billPaySystem", label: "Bill pay system", type: "text" },
      { name: "expenseManagementSystem", label: "Expense management system", type: "text" },
      { name: "churchManagementSystem", label: "Church management system", type: "text" },
      { name: "systemsIntegrate", label: "Do these systems currently integrate?", type: "select", options: ["Yes", "No", "Partially", "Not sure"] },
      { name: "bookManager", label: "Who currently manages the books?", type: "text" },
      { name: "monthlyReviewer", label: "Who reviews the books monthly?", type: "text" },
    ],
  },
  {
    id: "reporting_visibility",
    title: "Reporting and Leadership Visibility",
    intro: "What leadership can see now and where clarity is missing.",
    fields: [
      {
        name: "reportingFrequency",
        label: "How often are financial reports produced?",
        type: "select",
        options: ["Weekly", "Monthly", "Quarterly", "Annually", "Rarely", "Not sure"],
      },
      { name: "reportRecipients", label: "Who receives financial reports?", type: "text" },
      {
        name: "reportsProduced",
        label: "Reports currently produced",
        type: "checkbox",
        options: [
          "Statement of Activity / P&L",
          "Statement of Financial Position / Balance Sheet",
          "Budget vs Actual",
          "Cash Flow",
          "Department Reports",
          "Fund Reports",
          "Board Packet",
          "None / Not sure",
        ],
      },
      { name: "hardestQuestions", label: "What financial questions are hardest to answer right now?", type: "textarea" },
    ],
  },
  {
    id: "payroll_staffing",
    title: "Payroll and Staffing",
    intro: "Payroll cadence, staffing shape, and reimbursement flow.",
    fields: [
      { name: "payrollFrequency", label: "Payroll frequency", type: "select", options: ["Weekly", "Biweekly", "Semimonthly", "Monthly", "Other"] },
      { name: "ministerCount", label: "Number of ministers/clergy", type: "number" },
      { name: "housingAllowance", label: "Do you use housing allowance?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "benefitsOffered", label: "Benefits offered?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "retirementPlan", label: "Retirement plan?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "reimbursementsHandled", label: "How are reimbursements handled?", type: "select", options: ["Payroll", "Accounts payable", "Credit card", "Other", "Not sure"] },
    ],
  },
  {
    id: "giving_funds",
    title: "Giving, Funds, and Restrictions",
    intro: "How giving, restricted funds, campaigns, and grants are tracked.",
    fields: [
      { name: "givingPlatform", label: "Giving platform used", type: "text" },
      { name: "designatedFundCount", label: "Number of designated funds", type: "number" },
      { name: "restrictedGifts", label: "Do you track restricted gifts?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "campaignTracking", label: "Do you track campaigns separately?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "grantsReceived", label: "Do you receive grants?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "givingReconcilesMonthly", label: "Does donor giving reconcile to accounting monthly?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "fundNotes", label: "Notes about funds, restrictions, or campaigns", type: "textarea", optional: true },
    ],
  },
  {
    id: "banking_cash_debt",
    title: "Banking, Debt, and Cash",
    intro: "Cash visibility, reserves, accounts, and debt context.",
    fields: [
      { name: "checkingSavingsCount", label: "Number of checking/savings accounts", type: "number" },
      { name: "creditCardCount", label: "Number of credit cards", type: "number" },
      { name: "loansOrMortgages", label: "Loans or mortgages?", type: "select", options: ["Yes", "No"] },
      { name: "linesOfCredit", label: "Lines of credit?", type: "select", options: ["Yes", "No"] },
      { name: "reservePolicy", label: "Do you have a reserve policy?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "cashReserveMonths", label: "Current cash reserve in months", type: "select", options: ["Under 1 month", "1-3 months", "3-6 months", "6-12 months", "12+ months", "Not sure"] },
      { name: "cashNotes", label: "Notes about debt, reserves, or cash planning", type: "textarea", optional: true },
    ],
  },
  {
    id: "internal_controls",
    title: "Internal Controls",
    intro: "Approval, reconciliation, review, and policy structure.",
    fields: [
      { name: "expenseApprover", label: "Who approves expenses?", type: "text" },
      { name: "checkSigners", label: "Who can sign checks?", type: "text" },
      { name: "dualApprovals", label: "Are dual approvals required?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "bankReconciler", label: "Who reconciles bank accounts?", type: "text" },
      { name: "separateTransactionEntry", label: "Is that person different from the person entering transactions?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "boardReview", label: "Are monthly financials reviewed by board/elders?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "writtenPolicies", label: "Do you have written financial policies?", type: "select", options: ["Yes", "No", "Not sure"] },
      { name: "lastAudit", label: "Last audit, review, or compilation?", type: "select", options: ["Within 12 months", "1-3 years ago", "3+ years ago", "Never", "Not sure"] },
      { name: "cleanupIssues", label: "Any known cleanup issues?", type: "textarea", optional: true },
    ],
  },
  {
    id: "pain_points_goals",
    title: "Pain Points and Goals",
    intro: "Where the current rhythm helps, where it slows down, and what would be valuable.",
    fields: [
      { name: "workingWell", label: "What is working well?", type: "textarea" },
      { name: "feelsUnclear", label: "What feels unclear?", type: "textarea" },
      { name: "takesTooMuchTime", label: "What takes too much time?", type: "textarea" },
      { name: "hardDecisions", label: "What decisions are hard to make right now?", type: "textarea" },
      { name: "monthlyLeadershipView", label: "What would you want leadership to see every month?", type: "textarea" },
      { name: "valuableReport", label: "What would make this report valuable?", type: "textarea" },
    ],
  },
] as const;

export type IntakeSection = (typeof intakeSections)[number];
export type IntakeField = IntakeSection["fields"][number];

export function isIntakeFieldRequired(field: IntakeField) {
  return !("optional" in field && field.optional === true);
}

export const uploadFields = [
  "Most recent Statement of Activity / P&L",
  "Most recent Balance Sheet",
  "Most recent Budget vs Actual",
  "Chart of Accounts",
  "Payroll Summary",
  "Giving Summary",
  "Restricted Fund Report",
  "Bank Reconciliation Report",
  "Current Year Budget",
  "Board Financial Packet",
  "Other supporting document",
] as const;

export const allowedUploadTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const maxUploadSizeBytes = 10 * 1024 * 1024;
export const intakeStorageBucket = "financial-intake-files";
