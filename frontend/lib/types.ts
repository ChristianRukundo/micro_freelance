// Shared Frontend Types (Mirroring Backend Prisma Schema)

export enum UserRole {
  CLIENT = 'CLIENT',
  FREELANCER = 'FREELANCER',
  ADMIN = 'ADMIN',
}

export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  COMPLETED = 'COMPLETED',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum TransactionType {
  PLATFORM_FEE = 'PLATFORM_FEE',
  PAYOUT = 'PAYOUT',
  ESCROW_FUNDING = 'ESCROW_FUNDING',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
}

export enum NotificationType {
  NEW_BID = 'NEW_BID',
  BID_ACCEPTED = 'BID_ACCEPTED',
  MILESTONE_CREATED = 'MILESTONE_CREATED',
  MILESTONE_SUBMITTED = 'MILESTONE_SUBMITTED',
  MILESTONE_APPROVED = 'MILESTONE_APPROVED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  COMPLETED = 'COMPLETED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  TASK_CANCELLED = 'TASK_CANCELLED',
  PAYMENT_SUCCEEDED = 'PAYMENT_SUCCEEDED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  STRIPE_ACCOUNT_UPDATED = 'STRIPE_ACCOUNT_UPDATED',
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  bio?: string | null;
  skills: string[];
  portfolioLinks: string[];
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified?: Date | null;
  isSuspended: boolean;
  createdAt: Date;
  updatedAt: Date;
  stripeAccountId?: string | null;
  stripeAccountCompleted?: boolean;
  profile?: UserProfile | null;
}

export interface Category {
  id: string;
  name: string;
}

export interface Attachment {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  budget: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
  skills: String[];
  clientId: string;
  freelancerId?: string | null;
  categoryId: string;
  client?: User;
  freelancer?: User;
  category?: Category;
  attachments?: Attachment[];
  _count?: {
    bids: number;
  };
}

export interface Bid {
  id: string;
  proposal: string;
  amount: number;
  createdAt: Date;
  status: string; // e.g., PENDING, ACCEPTED, REJECTED
  freelancerId: string;
  taskId: string;
  freelancer?: User;
  task?: Task; // Added for convenience in some contexts
}

export interface Milestone {
  id: string;
  description: string;
  dueDate: Date;
  amount: number;
  status: MilestoneStatus;
  comments?: string | null;
  taskId: string;
  task?: Task; // Added for convenience
}

export interface Message {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  taskId: string;
  sender?: User;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  url: string;
  createdAt: Date;
  userId: string;
  taskId?: string | null;
  bidId?: string | null;
  milestoneId?: string | null;
  task?: Task;
  bid?: Bid;
  milestone?: Milestone;
}

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  stripeChargeId?: string | null;
  stripeTransferId?: string | null;
  platformFee?: number | null;
  createdAt: Date;
  userId: string;
  taskId?: string | null;
  milestoneId?: string | null;
  user?: User;
  task?: Task;
  milestone?: Milestone;
}


// API Response Structures (for paginated endpoints)
export interface PaginatedResponse<T> {
  data: T[]; // Renamed to data for consistency with `api` interceptor
  totalItems: number; // Total number of items across all pages
  currentPage: number;
  totalPages: number;
  itemsPerPage: number; // Items per page (limit)
}
export interface StripeCustomerData {
  onboardingUrl?: string;
  clientSecret?: string;
  paymentIntentId?: string;
}
// Specific paginated responses matching backend
export interface TasksPaginatedResponse extends PaginatedResponse<Task> {
  tasks: Task[];
}

export interface BidsPaginatedResponse extends PaginatedResponse<Bid> {
  bids: Bid[];
}

export interface MilestonesPaginatedResponse extends PaginatedResponse<Milestone> {
  milestones: Milestone[];
}

export interface UsersPaginatedResponse extends PaginatedResponse<User> {
  users: User[];
}

export interface NotificationsPaginatedResponse extends PaginatedResponse<Notification> {
  notifications: Notification[];
}

export interface TransactionsPaginatedResponse extends PaginatedResponse<Transaction> {
  transactions: Transaction[];
}