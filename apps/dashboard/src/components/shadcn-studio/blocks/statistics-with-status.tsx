import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'
import { TrendingUpIcon, MinusIcon, TrendingDownIcon, ShieldAlertIcon } from 'lucide-react'

export type StatisticsCardProps = {
  value: string
  title: string
  status: 'within' | 'observe' | 'exceed' | 'unknown'
  className?: string
  range: string
  icon?: React.ReactNode
  action?: React.ReactNode
}

const statusConfig = {
  within: {
    color: 'bg-green-600/10 dark:bg-green-400/10 text-green-600 dark:text-green-400',
    icon: (
      <TrendingUpIcon />
    ),
    label: 'On Track'
  },
  observe: {
    color: 'bg-amber-600/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400',
    icon: (
      <MinusIcon />
    ),
    label: 'Stable'
  },
  exceed: {
    color: 'bg-destructive/10 text-destructive',
    icon: (
      <TrendingDownIcon />
    ),
    label: 'At Risk'
  },
  unknown: {
    color: 'bg-sky-600/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400',
    icon: (
      <ShieldAlertIcon />
    ),
    label: 'Under Review'
  }
}

const StatisticsCard = ({ status, value, title, className, range, icon, action }: StatisticsCardProps) => {
  return (
    <Card className={cn('relative flex flex-col gap-1 py-3.5 [--card-spacing:14px]', className)}>
      <CardHeader className='flex flex-row items-center justify-between pb-0 gap-2'>
        <CardTitle className='text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-12'>{title}</CardTitle>
      </CardHeader>

      {(action || icon) && (
        <div className="absolute top-3.5 right-3.5 flex items-center space-x-1.5 z-10">
          {action}
          {icon && (
            <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-sm [&>svg]:size-4'>
              {icon}
            </div>
          )}
        </div>
      )}

      <CardContent className='flex flex-col gap-2.5 pt-1.5'>
        <p className='text-2xl font-bold tracking-tight text-foreground'>{value}</p>

        <Badge className={cn(statusConfig[status].color, 'gap-1.2 [&>svg]:size-3 border-none shadow-none cursor-default py-0.5 text-[10px] w-fit font-medium')}>
          {statusConfig[status].icon}
          <span>{statusConfig[status].label}:</span>
          <span>{range}</span>
        </Badge>
      </CardContent>
    </Card>
  )
}

export default StatisticsCard
