'use client';

import { Notification } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2Icon, MessageSquareTextIcon, DollarSignIcon, BellIcon, MailIcon, ClockIcon, AlertCircleIcon, BadgeCheckIcon, XCircleIcon } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NotificationType } from '@/lib/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface NotificationCardProps {
  notification: Notification;
}

const NotificationIcon = ({ type }: { type: NotificationType }) => {
  switch (type) {
    case NotificationType.NEW_BID: return <MessageSquareTextIcon className="h-5 w-5 text-primary-500" />;
    case NotificationType.BID_ACCEPTED: return <CheckCircle2Icon className="h-5 w-5 text-success-500" />;
    case NotificationType.MILESTONE_CREATED: return <BellIcon className="h-5 w-5 text-primary-500" />;
    case NotificationType.MILESTONE_SUBMITTED: return <BellIcon className="h-5 w-5 text-warning-500" />;
    case NotificationType.MILESTONE_APPROVED: return <BadgeCheckIcon className="h-5 w-5 text-success-500" />;
    case NotificationType.REVISION_REQUESTED: return <AlertCircleIcon className="h-5 w-5 text-error-500" />;
    case NotificationType.NEW_MESSAGE: return <MessageSquareTextIcon className="h-5 w-5 text-primary-500" />;
    case NotificationType.TASK_CANCELLED: return <XCircleIcon className="h-5 w-5 text-destructive-500" />;
    case NotificationType.PAYMENT_SUCCEEDED: return <DollarSignIcon className="h-5 w-5 text-success-500" />;
    case NotificationType.EMAIL_VERIFIED: return <MailIcon className="h-5 w-5 text-success-500" />;
    case NotificationType.PASSWORD_RESET: return <ClockIcon className="h-5 w-5 text-neutral-500" />;
    case NotificationType.STRIPE_ACCOUNT_UPDATED: return <DollarSignIcon className="h-5 w-5 text-primary-500" />;
    default: return <BellIcon className="h-5 w-5 text-neutral-500" />;
  }
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const { markNotificationAsRead, isMarkingNotificationAsRead } = useNotifications();

  const handleMarkAsRead = async () => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        // toast.success('Notification marked as read.'); // Handled by useNotifications mutation
      } catch (error) {
        // Error toast handled by useNotifications mutation
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card
        className={cn(
          'w-full rounded-xl border border-neutral-200 bg-card shadow-soft transition-all duration-300 ease-in-out-quad',
          !notification.isRead ? 'bg-primary-50 hover:bg-primary-100' : 'hover:bg-neutral-50',
        )}
      >
        <Link href={notification.url} passHref className="absolute inset-0 z-10" aria-label={`View notification: ${notification.message}`}></Link>
        <CardContent className="flex items-center p-4">
          <div className="flex-shrink-0">
            <NotificationIcon type={notification.type} />
          </div>
          <div className="ml-4 flex-1">
            <p className={cn(
              'text-body-md text-neutral-800',
              !notification.isRead && 'font-semibold text-primary-800'
            )}>
              {notification.message}
            </p>
            <p className="text-caption text-neutral-500 mt-1 flex items-center">
              <ClockIcon className="h-3 w-3 mr-1" /> {formatRelativeTime(notification.createdAt)}
            </p>
          </div>
          {!notification.isRead && (
            <div className="flex-shrink-0 ml-4 relative z-20">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMarkAsRead}
                disabled={isMarkingNotificationAsRead}
                className="h-8 w-8 text-neutral-500 hover:text-primary-500"
                aria-label="Mark as read"
              >
                {isMarkingNotificationAsRead ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <CheckCircle2Icon className="h-5 w-5" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}