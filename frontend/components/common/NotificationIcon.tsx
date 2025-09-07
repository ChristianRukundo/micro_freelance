import {
  BellIcon,
  CheckCircle2Icon,
  MessageSquareTextIcon,
  DollarSignIcon,
  AlertCircleIcon,
  BadgeCheckIcon,
  XCircleIcon,
  MailIcon,
  ClockIcon,
} from "lucide-react";
import { NotificationType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

/**
 * A reusable component that displays a relevant icon based on the notification type.
 */
export const NotificationIcon = ({
  type,
  className,
}: NotificationIconProps) => {
  const iconProps = { className: cn("h-5 w-5", className) };

  switch (type) {
    case NotificationType.NEW_BID:
      return (
        <MessageSquareTextIcon
          {...iconProps}
          className={cn("text-primary-500", className)}
        />
      );
    case NotificationType.BID_ACCEPTED:
      return (
        <CheckCircle2Icon
          {...iconProps}
          className={cn("text-success-500", className)}
        />
      );
    case NotificationType.MILESTONE_CREATED:
      return (
        <BellIcon
          {...iconProps}
          className={cn("text-primary-500", className)}
        />
      );
    case NotificationType.MILESTONE_SUBMITTED:
      return (
        <BellIcon
          {...iconProps}
          className={cn("text-warning-500", className)}
        />
      );
    case NotificationType.MILESTONE_APPROVED:
      return (
        <BadgeCheckIcon
          {...iconProps}
          className={cn("text-success-500", className)}
        />
      );
    case NotificationType.REVISION_REQUESTED:
      return (
        <AlertCircleIcon
          {...iconProps}
          className={cn("text-error-500", className)}
        />
      );
    case NotificationType.NEW_MESSAGE:
      return (
        <MessageSquareTextIcon
          {...iconProps}
          className={cn("text-primary-500", className)}
        />
      );
    case NotificationType.TASK_CANCELLED:
      return (
        <XCircleIcon
          {...iconProps}
          className={cn("text-destructive-500", className)}
        />
      );
    case NotificationType.PAYMENT_SUCCEEDED:
      return (
        <DollarSignIcon
          {...iconProps}
          className={cn("text-success-500", className)}
        />
      );
    case NotificationType.EMAIL_VERIFIED:
      return (
        <MailIcon
          {...iconProps}
          className={cn("text-success-500", className)}
        />
      );
    case NotificationType.PASSWORD_RESET:
      return (
        <ClockIcon
          {...iconProps}
          className={cn("text-muted-foreground", className)}
        />
      );
    case NotificationType.STRIPE_ACCOUNT_UPDATED:
      return (
        <DollarSignIcon
          {...iconProps}
          className={cn("text-primary-500", className)}
        />
      );
    default:
      return (
        <BellIcon
          {...iconProps}
          className={cn("text-muted-foreground", className)}
        />
      );
  }
};
