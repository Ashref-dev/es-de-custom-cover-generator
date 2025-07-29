'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Game } from '@/types';
import { CONSOLES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface GameListViewProps {
  games: Game[];
  onViewGame: (game: Game) => void;
  className?: string;
}

/**
 * List view component that displays games in a compact table format
 */
export function GameListView({
  games,
  onViewGame,
  className = '',
}: GameListViewProps) {
  const getCompletionPercentage = (game: Game): number => {
    const totalTypes = Object.keys(game.mediaStatus).length;
    const presentTypes = Object.values(game.mediaStatus).filter(Boolean).length;
    return Math.round((presentTypes / totalTypes) * 100);
  };

  const getCompletionColor = (percentage: number): string => {
    if (percentage === 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getMediaTypeIndicator = (isPresent: boolean) => {
    return (
      <div className='flex items-center justify-center w-full h-full'>
        {isPresent ? (
          <CheckCircle className='h-3.5 w-3.5 text-green-600' />
        ) : (
          <XCircle className='h-3.5 w-3.5 text-red-400/60' />
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 overflow-hidden bg-card shadow-sm',
        className
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className='border-b border-border/60 bg-muted/30'>
            <TableHead className='font-semibold text-foreground pl-4 w-auto min-w-[280px]'>
              Game
            </TableHead>
            <TableHead className='font-semibold text-foreground hidden sm:table-cell w-[110px]'>
              Console
            </TableHead>
            <TableHead className='font-semibold text-foreground w-[100px]'>
              Completion
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground w-[50px] px-1'>
              Cover
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden md:table-cell w-[50px] px-1'>
              Logo
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden lg:table-cell w-[50px] px-1'>
              Screen
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden lg:table-cell w-[50px] px-1'>
              Title
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden xl:table-cell w-[50px] px-1'>
              3D Box
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden xl:table-cell w-[50px] px-1'>
              Back
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden xl:table-cell w-[50px] px-1'>
              Fan Art
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground hidden xl:table-cell w-[50px] px-1'>
              Physical
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground w-[50px] px-1'>
              Video
            </TableHead>
            <TableHead className='text-center font-semibold text-foreground pr-4 w-[60px]'>
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.map((game, index) => {
            const completion = getCompletionPercentage(game);
            const consoleLabel =
              CONSOLES.find((c) => c.value === game.console)?.label ||
              game.console;

            return (
              <TableRow
                key={game.id}
                className={cn(
                  'border-b border-border/40 hover:bg-muted/40 transition-colors duration-150',
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                )}
              >
                <TableCell className='font-medium pl-4 py-3'>
                  <div className='flex flex-col'>
                    <span
                      className='text-sm font-semibold text-foreground truncate max-w-[250px]'
                      title={game.name}
                    >
                      {game.name}
                    </span>
                    <span className='text-xs text-muted-foreground mt-0.5 sm:hidden'>
                      {consoleLabel} • {completion}%
                    </span>
                  </div>
                </TableCell>
                <TableCell className='py-3 hidden sm:table-cell'>
                  <Badge
                    variant='outline'
                    className='text-xs font-medium bg-background border-border/60'
                  >
                    {consoleLabel}
                  </Badge>
                </TableCell>
                <TableCell className='py-3'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={cn(
                        'text-sm font-semibold min-w-[30px]',
                        getCompletionColor(completion)
                      )}
                    >
                      {completion}%
                    </span>
                    <div className='w-12 h-1.5 bg-muted/60 rounded-full overflow-hidden'>
                      <div
                        className={cn(
                          'h-full transition-all duration-500 rounded-full',
                          completion === 100
                            ? 'bg-green-500'
                            : completion >= 75
                            ? 'bg-blue-500'
                            : completion >= 50
                            ? 'bg-yellow-500'
                            : completion >= 25
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className='py-3 px-1'>
                  {getMediaTypeIndicator(game.mediaStatus.covers)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden md:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.marquees)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden lg:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.screenshots)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden lg:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.titlescreens)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden xl:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus['3dboxes'])}
                </TableCell>
                <TableCell className='py-3 px-1 hidden xl:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.backcovers)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden xl:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.fanart)}
                </TableCell>
                <TableCell className='py-3 px-1 hidden xl:table-cell'>
                  {getMediaTypeIndicator(game.mediaStatus.physicalmedia)}
                </TableCell>
                <TableCell className='py-3 px-1'>
                  {getMediaTypeIndicator(game.mediaStatus.videos)}
                </TableCell>
                <TableCell className='py-3 pr-4'>
                  <div className='flex items-center justify-center'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => onViewGame(game)}
                      className='h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary transition-colors'
                    >
                      <Eye className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {games.length === 0 && (
        <div className='py-12 text-center'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center'>
              <Eye className='h-6 w-6 text-muted-foreground' />
            </div>
            <div className='space-y-1'>
              <p className='text-sm font-medium text-foreground'>
                No games found
              </p>
              <p className='text-xs text-muted-foreground'>
                Try adjusting your filters or search criteria
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
