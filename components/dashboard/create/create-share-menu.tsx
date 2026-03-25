'use client';

import { Copy, Download, ExternalLink, Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CreateSocialShareItems } from '@/components/dashboard/create/constants';
import { toast } from '@/components/ui/use-toast';

interface CreateShareMenuProps {
  disabled?: boolean;
  onDownload: () => void;
}

export function CreateShareMenu({ disabled, onDownload }: CreateShareMenuProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast({ title: 'Share link copied' });
  };

  const openShareTarget = (baseUrl: string) => {
    window.open(`${baseUrl}${encodeURIComponent(window.location.href)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="default"
          size="lg"
          disabled={disabled}
          className="h-12 rounded-2xl bg-[linear-gradient(135deg,#ff77c8,#f65dff)] px-5 text-black hover:opacity-95"
        >
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 border-white/10 bg-background/95 backdrop-blur-xl">
        <DropdownMenuLabel>Share Output</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handleCopy()}>
          <Copy className="mr-2 h-4 w-4" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download image
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {CreateSocialShareItems.map((item) => (
          <DropdownMenuItem key={item.id} onSelect={() => openShareTarget(item.url)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
