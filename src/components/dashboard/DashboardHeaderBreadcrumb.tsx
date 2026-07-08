import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { resolveDashboardBreadcrumb } from '@/lib/dashboard-nav';

export function DashboardHeaderBreadcrumb() {
  const { pathname } = useLocation();
  const crumb = resolveDashboardBreadcrumb(pathname);

  if (!crumb) {
    return null;
  }

  return (
    <Breadcrumb className="min-w-0 flex-1">
      <BreadcrumbList className="flex-nowrap text-[13px]">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className="hidden sm:inline-flex">
          <span className="text-muted-foreground">{crumb.group}</span>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:block" />
        <BreadcrumbItem className="min-w-0">
          <BreadcrumbPage className="truncate font-medium">{crumb.label}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
