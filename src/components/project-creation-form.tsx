'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createProjectAction } from '@/lib/actions/projects';
import { Loader2, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';

export function ProjectCreationForm() {
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError(null);

    startTransition(async () => {
      const result = await createProjectAction(formData);

      if (!result.success) {
        setError(result.error || 'Failed to create project');
        return;
      }

      // Success - redirect to dashboard
      if (result.redirect) {
        router.push(result.redirect);
      } else {
        router.push('/dashboard');
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Shop Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Shop Name *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="My Awesome Shop"
          required
          maxLength={100}
        />
        <p className="text-muted-foreground text-sm">
          This will be the name of your shop that customers will see
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Shop Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Tell customers about your shop, what you sell, and what makes you special..."
          rows={4}
          maxLength={500}
          className="resize-none"
        />
        <p className="text-muted-foreground text-sm">
          Optional: A brief description of your shop and what you sell
        </p>
      </div>

      {/* Telegram Bot Token */}
      <div className="space-y-2">
        <Label htmlFor="telegram_bot_token">Telegram Bot Token *</Label>
        <div className="relative">
          <Input
            id="telegram_bot_token"
            name="telegram_bot_token"
            type={showToken ? 'text' : 'password'}
            placeholder="123456789:AAEhBOweik6ad..."
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 transform"
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-muted-foreground text-sm">
          <p>
            Get this from @BotFather on Telegram.{' '}
            <a
              href="https://core.telegram.org/bots/tutorial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary inline-flex items-center gap-1 hover:underline"
            >
              View tutorial
              <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-destructive mt-0.5 h-4 w-4" />
            <div className="space-y-2">
              <div className="text-destructive text-sm">{error}</div>
              {error.includes('bot token') && (
                <div className="text-destructive/80 space-y-1 text-xs">
                  <p>Make sure your bot token:</p>
                  <ul className="ml-2 list-inside list-disc space-y-1">
                    <li>Starts with numbers followed by a colon (:)</li>
                    <li>Is copied exactly from @BotFather</li>
                    <li>Contains no extra spaces or characters</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Your Shop...
          </>
        ) : (
          'Create My Shop'
        )}
      </Button>

      {/* MVP Note */}
      <p className="text-muted-foreground text-center text-xs">
        Note: You can only create one shop per account. This helps us keep things simple and
        focused.
      </p>
    </form>
  );
}

export default ProjectCreationForm;
