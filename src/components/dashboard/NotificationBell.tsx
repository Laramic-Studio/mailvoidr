import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotificationMutations,
  useNotifications,
  useUnreadNotificationCount,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

function formatWhen(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications(open);
  const { markRead, markAllRead } = useNotificationMutations();
  const notifications = data?.data ?? [];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid="topbar-notifications"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-border transition-colors hover:bg-accent"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="text-[13px] font-medium">Notifications</div>
          {unreadCount > 0 ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              disabled={markAllRead.isPending}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          ) : null}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-3 py-8 text-center text-[12px] text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => {
              const unread = !item.read_at;
              const content = (
                <div className="flex flex-col gap-0.5">
                  <div className={cn('text-[13px]', unread && 'font-medium')}>{item.title}</div>
                  {item.body ? (
                    <div className="text-[12px] text-muted-foreground">{item.body}</div>
                  ) : null}
                  <div className="text-[11px] text-muted-foreground">{formatWhen(item.created_at)}</div>
                </div>
              );

              if (item.href) {
                return (
                  <DropdownMenuItem key={item.id} asChild className="cursor-pointer px-3 py-2.5">
                    <Link
                      to={item.href}
                      onClick={() => {
                        if (unread) markRead.mutate(item.id);
                      }}
                    >
                      {content}
                    </Link>
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuItem
                  key={item.id}
                  className="cursor-pointer px-3 py-2.5"
                  onClick={() => {
                    if (unread) markRead.mutate(item.id);
                  }}
                >
                  {content}
                </DropdownMenuItem>
              );
            })
          )}
        </div>
        {notifications.length > 0 ? <DropdownMenuSeparator /> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
